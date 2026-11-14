import { IncomingMessage, Server } from "node:http";
import {WebSocketServer, WebSocket, RawData} from "ws"
import {Duplex} from "node:stream";
import {MessageReply, PeerData, RelayService} from "./relay.service.js";
import {ZodError} from "zod";

import {ConfigService} from "../../services/config/config.service.js";
import {LoggerService} from "../../services/logger/logger.service.js";
import {PeerSentMessageSchema, RelaySentMessageSchema} from "../../services/validation/messages.js";

export interface RelayPeer extends WebSocket {
	peerData: PeerData;
	// Measuring connection activity to close unresponsive sockets
	isAlive: boolean
}

export class RelayController {
	#wss: WebSocketServer
	#connectionCheck: NodeJS.Timeout

	constructor(
		server: Server,
		private readonly configService: ConfigService,
		private readonly loggerService: LoggerService,
		private readonly relayService: RelayService,
	) {
		this.#wss = new WebSocketServer({ noServer: true });

		server.on("upgrade", this.handleServerUpgrade.bind(this));
		this.#wss.on("connection", this.handleConnection.bind(this));
		this.#wss.on("close", this.handleClose.bind(this));

		this.loggerService.info("server", `started connection checks every ${this.configService.config().relay.connectionCheckInterval}ms`)
		this.#connectionCheck = setInterval(this.runConnectionCheck.bind(this), this.configService.config().relay.connectionCheckInterval);
	}

	async handleServerUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
		const baseUrl = `http://${req.headers.host}`
		const url = new URL(`${baseUrl}${req.url}`);
		const relayPath = new URLPattern(`${baseUrl}/relay/:rid`);
		
		const rid = relayPath.exec(url)?.pathname?.groups["rid"];
		const pid = url.searchParams.get("pid");
		const knownAs = url.searchParams.get("knownAs");
		const accessSecret = req.headers["sec-websocket-protocol"];

		try {
			const peerData = PeerData.parse({rid, pid, knownAs})
			const replies = await this.relayService.connect(peerData, accessSecret)

			// @ts-ignore --- Using custom type which expands WebSocket type with metadata
			this.#wss.handleUpgrade(req, socket, head, async (socket: RelayPeer) => {
				socket.peerData = peerData;
				socket.isAlive = true;
				this.#wss.emit("connection", socket, req);
				this.sendReplies(replies)
			})
		}
		catch (error) {
			if (error instanceof ZodError) {
				this.loggerService.warn("connection", "denied connection due to invalid peer data", error);	
			}
			else {
				this.loggerService.warn("connection", "denied connection due to unexpected error", error);
			}
			socket.destroy();
		}
	}

	handleConnection(ws: RelayPeer) {
		this.loggerService.info("connection", `peer '${ws.peerData.pid}' (${ws.peerData.knownAs ?? 'no knownAs'}) connected to relay '${ws.peerData.rid}'`)

		// todo: is this needed?
		ws.on("error", (e) => {
			this.loggerService.error("server", `encountered error with peer '${ws.peerData.pid}' (${ws.peerData.knownAs ?? 'no knownAs'})`, e)
		});

		ws.on("message", async (data, isBinary) => {
			// todo: apply rate limiting/abuse protection for clients?
			await this.handleMessage(ws, data, isBinary)
		});

		ws.on("close", async () => {
			this.loggerService.info("connection", `peer '${ws.peerData.pid}' (${ws.peerData.knownAs ?? 'no knownAs'}) disconnecting from relay '${ws.peerData.rid}'`)
		})
	}

	handleClose() {
		this.loggerService.info("server", "server closing, stopping connection checks")
		clearInterval(this.#connectionCheck)
	}

	async handleMessage(sourceSocket: RelayPeer, data: RawData, isBinary?: boolean) {
		const ws = (sourceSocket as RelayPeer);

		if (isBinary) {
			this.loggerService.warn("message", `peer '${ws.peerData.pid}' (${ws.peerData.knownAs ?? 'no knownAs'}) sent invalid message, binary not allowed.`)
			return;
		}
		let message: PeerSentMessageSchema;
		try {
			const rawMessage = JSON.parse(data.toString());
			message = PeerSentMessageSchema.parse(rawMessage)
		}
		catch (e) {
			this.loggerService.warn("message", `peer '${ws.peerData.pid}' (${ws.peerData.knownAs ?? 'no knownAs'}) sent invalid message`, e)
			return;
		}

		ws.isAlive = true;
		const replies = await this.relayService.processMessage(ws.peerData.pid, message)
		this.sendReplies(replies)
	}

	async runConnectionCheck() {
		this.loggerService.debug("server", `running connection health check for ${this.#wss.clients.size} total peers`);

		for (const ws of this.#wss.clients as Iterable<RelayPeer>) {
			if (!ws.isAlive) {
				this.loggerService.info("connection", `disconnecting peer '${ws.peerData.pid}' (${ws.peerData.knownAs ?? 'no knownAs'}) from relay '${ws.peerData.rid}' due to failed connection check`);
				await this.relayService.disconnect(ws.peerData.pid);
				return ws.terminate();
			}

			ws.isAlive = false;
			this.send(ws, {kind: "health/ping"})
		}
	}

	/**
	 * Get the WebSocket client with the requested pid or null if no matching client is found.
	 *
	 * @param pid
	 */
	getPeerById(pid: string) {
		for (const ws of this.#wss.clients as Iterable<RelayPeer>) {
			if (ws.peerData.pid === pid) {
				return ws;
			}
		}

		return null;
	}

	/**
	 * Type-safe wrapper to send message to the requested socket.
	 * If passing a string pid and the peer isn't found, an error will be thrown.
	 *
	 * @param target
	 * @param message
	 */
	send(target: RelayPeer | string, message: RelaySentMessageSchema) {
		let socket: RelayPeer | null
		if (typeof target === 'string') {
			socket = this.getPeerById(target)
		} else {
			socket = target;
		}

		if (!socket) {
			throw new Error(`[controller] Attempted to send message to peer '${target}' but it was not found.`)
		}
		socket.send(JSON.stringify(message));
	}

	/**
	 * Type-safe wrapper to send message replies.
	 *
	 * @param replies
	 */
	sendReplies(replies: MessageReply[]) {
		for (const reply of replies) {
			for (const pid of reply.peers) {
				this.send(pid, reply.message)
			}
		}
	}
}
