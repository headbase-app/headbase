import { WebSocketServer, WebSocket } from "ws";
import {IncomingMessage, Server} from "node:http";
import {EnvironmentService} from "@services/environment/environment.service.js";
import {
    ConnectionData,
    InitialConnection,
    SyncAction,
    SyncService
} from "@modules/sync/sync.service.js";
import internal from "node:stream";
import {ClientSentEvents, ServerSentEvents, ServerWelcomeEvent} from "@modules/sync/events.js";
import {AccessError} from "@services/errors/access/access.error.js";
import {ErrorIdentifiers} from "@headbase-app/common";

export interface SyncWebsocketControllerConfig {
    path: string;
}

export interface SocketStore {
    [socketKey: string]: WebsocketWithConnectionData
}

export interface RoomStore {
    [roomKey: string]: Set<string>
}

export interface WebsocketWithConnectionData extends WebSocket {
    connectionData: ConnectionData;
}

export class SyncWebsocketController {
    // todo: could controller be created via factory function for DI so these could be setup in constructor?
    // @ts-expect-error -- hard to define via constructor when using DI, and unclean to guard every usage.
    wss: WebSocketServer
    // @ts-expect-error -- hard to define via constructor when using DI, and unclean to guard every usage.
    #config: SyncWebsocketControllerConfig
    #sockets: SocketStore = {}
    #rooms: RoomStore = {}

    constructor(
        private readonly envService: EnvironmentService,
        private readonly syncService:  SyncService,
    ) {}

    async init(server: Server, config: SyncWebsocketControllerConfig) {
        this.#config = config
        this.wss = new WebSocketServer({ noServer: true, clientTracking: false });

        // This is how the sync service requests events to be sent.
        // The websocket controller is just responsible for coordinating the websockets and storing "rooms" of websockets.
        // All the logic for handling what/when events fire and the authorization for what rooms a connection belongs
        // to is handled by the sync service.
        this.syncService.registerActionCallback(this.syncActionCallback.bind(this))

        server.on("upgrade", this.handleServerUpgrade.bind(this))
        this.wss.on("connection", this.handleConnection.bind(this))
    }

    async handleServerUpgrade(req: IncomingMessage, socket: internal.Duplex, head: Buffer) {
        // Validate that the request is to the correct path and that the origin header matches an allowed origin.
        if (
            req.url !== this.#config.path ||
            !req.headers.origin ||
            !this.envService.vars.general.allowedOrigins.includes(req.headers.origin)
        ) {
            // todo: send error response of some kind?
            socket.destroy();
            return
        }

        // Validate that the request has a valid ticket
        const websocketProtocol = req.headers["sec-websocket-protocol"]
        if (typeof websocketProtocol !== "string" || !websocketProtocol.startsWith("headbase.ticket.")) {
            // todo: send error response of some kind?
            socket.destroy()
            return;
        }
        const connectionTicket = websocketProtocol.replace("headbase.ticket.", "");

        let initialConnection: InitialConnection
        try {
            initialConnection = await this.syncService.validateTicket(connectionTicket)
        }
        catch (error) {
            // todo: send error response of some kind?
            socket.destroy()
            return;
        }
        
        // If an existing socket already exists for the given session id, ensure it is closed before opening a new one.
        // todo: should this sit with the service, or should this be blocked when receiving a token?
        if (this.#sockets[initialConnection.connectionData.sessionId]) {
            await this.purgeSocket(initialConnection.connectionData.sessionId);
        }

        // @ts-expect-error -- types of WebSocket and WebsocketWithConnectionData are incompatible, this is fine as .connectionData is custom and added here.
        this.wss.handleUpgrade(req, socket, head, async (ws: WebsocketWithConnectionData) => {
            // Assign the sessionId directly to websocket so it can be used to identify it later
            ws.connectionData = initialConnection.connectionData

            // Add to the stored sockets and process any initial rooms
            this.#sockets[initialConnection.connectionData.sessionId] = ws
            if (initialConnection.rooms) {
                await this.changeRooms(initialConnection.connectionData.sessionId, initialConnection.rooms)
            }

            this.wss.emit("connection", ws, req)
        })
    }

    handleConnection(ws: WebsocketWithConnectionData) {
        // todo: is this needed?
        ws.on("error", console.error);

        ws.on("message", async (data) => {
            // Parse and validate that this is a known event.
            const parsedEvent = ClientSentEvents.safeParse(data)
            if (!parsedEvent.success) {
                await this.purgeSocket(ws.connectionData.sessionId)
                return
            }
            const event = parsedEvent.data

            switch (event.type) {
                case "ticket": {
                    try {
                        await this.syncService.validateTicket(event.data.ticket, ws.connectionData)

                        await this.sendEventToSocket(ws, {type: "ack", data: {messageId: event.messageId}})
                    }
                    catch (error) {
                        if (error instanceof AccessError) {
                            await this.purgeSocket(ws.connectionData.sessionId)
                        }

                        // todo: write proper error handler?
                        await this.sendEventToSocket(ws, {type: "error", data: {messageId: event.messageId, identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED}})
                    }
                    break;
                }
                case "subscribe": {
                    try {
                        const newRooms = await this.syncService.requestSubscriptions(ws.connectionData.userId, event.data.vaults)
                        await this.changeRooms(ws.connectionData.sessionId, newRooms)

                        await this.sendEventToSocket(ws, {
                            type: "ack",
                            data: {messageId: event.messageId}
                        })
                    }
                    catch (error) {
                        // todo: write proper error handler
                        await this.sendEventToSocket(ws, {type: "error", data: {messageId: event.messageId, identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED}})
                    }
                    break;
                }
                // No unrecognised event should have passed data parsing & validation, but handle this default case just in case.
                default: {
                    await this.purgeSocket(ws.connectionData.sessionId)
                }
            }
        });

        const welcomeEvent: ServerWelcomeEvent = {type: "welcome"}
        ws.send(JSON.stringify(welcomeEvent))
    }

    async syncActionCallback(syncAction: SyncAction) {
        if (syncAction.type === "disconnect-session") {
            await this.purgeSocket(syncAction.sessionId)
        }
        else if (syncAction.type === "disconnect-user") {
            for (const [sessionId, socket] of Object.entries(this.#sockets)) {
                if (socket.connectionData.userId === syncAction.userId) {
                    await this.purgeSocket(sessionId)
                }
            }
        }
        else if (syncAction.type === "delete-rooms") {
            for (const roomId of syncAction.rooms) {
                if (this.#rooms[roomId]) {
                    delete this.#rooms[roomId]
                }
            }
        }
        else {
            for (const roomId of syncAction.rooms) {
                await this.sendEventToRoom(roomId, syncAction.event, syncAction.ignoreSessions)
            }
        }
    }

    async purgeSocket(sessionId: string) {
        // Ensure the connection is removed from all rooms
        for (const roomId of Object.keys(this.#rooms)) {
            this.#rooms[roomId].delete(sessionId)
        }

        // Close the connection and remove from the socket store
        if (this.#sockets[sessionId]) {
            this.#sockets[sessionId].close()
            delete this.#sockets[sessionId];
        }
    }

    async sendEventToSocket(ws: WebsocketWithConnectionData, event: ServerSentEvents) {
        // todo: should even sending go via the sessionId and #sockets?
        ws.send(JSON.stringify(event))
    }

    async sendEventToRoom(roomId: string, event: ServerSentEvents, ignoreSessions?: string[]) {
        // todo: are checks for room and socket required, or should errors be thrown?
        if (this.#rooms[roomId]) {
            for (const sessionId of this.#rooms[roomId]) {
                if (this.#sockets[sessionId]) {
                    // If the session is to be ignored, just move onto the next one
                    if (ignoreSessions && ignoreSessions.includes(sessionId)) {
                        continue
                    }

                    this.#sockets[sessionId].send(JSON.stringify(event))
                }
            }
        }
    }
    
    async changeRooms(sessionId: string, newRooms: string[]) {
        // todo: is this socket check actually needed, or should error be thrown?
        if (this.#sockets[sessionId]) {
            // Remove session from all rooms
            for (const roomId of Object.keys(this.#rooms)) {
                if (this.#rooms[roomId].has(sessionId)) {
                    this.#rooms[roomId].delete(sessionId)
                }
            }

            // Add session to required rooms
            for (const roomId of newRooms) {
                if (this.#rooms[roomId]) {
                    this.#rooms[roomId].add(sessionId)
                }
                else {
                    this.#rooms[roomId] = new Set([sessionId])
                }
            }

            // Use this as a chance to clean up any empty rooms
            // todo: should this be it's own task running in the background?
            for (const roomId of Object.keys(this.#rooms)) {
                if (this.#rooms[roomId].size === 0) {
                    delete this.#rooms[roomId]
                }
            }
        }
    }
}
