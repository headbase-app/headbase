import { Injectable } from "@nestjs/common";
import { z } from "zod";
import crypto from "node:crypto";
import ms from "ms";

import { ErrorIdentifiers } from "@headbase-app/contracts";

import { EventsService } from "@services/events/events.service.js";
import { RequestUser } from "@common/request-context.js";
import { AccessUnauthorizedError } from "@services/errors/access/access-unauthorized.error.js";
import { SystemError } from "@services/errors/base/system.error.js";
import { AccessForbiddenError } from "@services/errors/access/access-forbidden.error.js";
import { EventIdentifiers, ExternalServerEvent, ServerEvent } from "@services/events/events.js";
import { VaultsService } from "@modules/vaults/vaults.service.js";

// Actions which are sent by the sync service to the websocket controller.
// The websocket controller stores sockets and rooms, but relies on the service for all logic.
export type SyncAction =
	| {
			type: "send-event";
			rooms: string[];
			ignoreSessions?: string[];
			event: ExternalServerEvent;
	  }
	| {
			type: "disconnect-session";
			sessionId: string;
	  }
	| {
			type: "disconnect-user";
			userId: string;
	  }
	| {
			type: "delete-rooms";
			rooms: string[];
	  };

export type SyncActionCallback = (action: SyncAction) => Promise<void>;

export interface ConnectionData {
	sessionId: string;
	userId: string;
	expiry: number;
}

export interface InitialConnection {
	connectionData: ConnectionData;
	rooms: string[];
}

export const ConnectionTicketData = z
	.object({
		userId: z.string().uuid(),
		sessionId: z.string().uuid(),
		connectionExpiry: z.number(),
		ticketExpiry: z.number(),
	})
	.strict();
export type ConnectionTicketData = z.infer<typeof ConnectionTicketData>;

@Injectable()
export class SyncService {
	#actionCallback: SyncActionCallback | null = null;

	constructor(
		private readonly eventService: EventsService,
		private readonly vaultsService: VaultsService,
	) {}

	onApplicationBootstrap() {
		// All server events will need to be processed as they will require socket events
		this.eventService.subscribeAll((e: CustomEvent<ServerEvent>) => {
			this.handleServerEvent({
				// @ts-expect-error -- just allow types to work here
				type: e.type,
				// @ts-expect-error -- just allow types to work here
				detail: e.detail,
			});
		});
	}

	registerActionCallback(callback: (action: SyncAction) => Promise<void>) {
		this.#actionCallback = callback;
	}

	// eslint-disable-next-line
	async requestTicket(requestUser: RequestUser): Promise<string> {
		// todo: validate that request user has permissions and is verified.

		const ticketExpiry = new Date().getTime() + ms("15m"); // todo: change to 15s after initial testing
		const connectionExpiry = new Date().getTime() + ms("15m");
		const connectionData: ConnectionTicketData = {
			userId: requestUser.id,
			sessionId: requestUser.sessionId,
			// When the connection will expiry and require refreshing
			connectionExpiry: connectionExpiry,
			// When the provided token will expire and no longer be usable to open a websocket connection
			ticketExpiry: ticketExpiry,
		};
		const connectionTicket = crypto.randomBytes(16).toString("hex");

		// await this.dataStoreService.addItem(connectionTicket, JSON.stringify(connectionData), { epochExpiry: ticketExpiry });

		return connectionTicket;
	}

	/**
	 * Validate that the supplied connection ticket is valid.
	 * Will return a list of rooms that the user should join if valid, and throw an error if not.
	 *
	 * @param connectionTicket
	 * @param existingConnection
	 */
	// eslint-disable-next-line
	async validateTicket(connectionTicket: string, existingConnection?: ConnectionData): Promise<InitialConnection> {
		// const item = await this.dataStoreService.getItem(connectionTicket);
		const connectionTicketData = "";

		if (!connectionTicketData) {
			throw new AccessUnauthorizedError({ identifier: ErrorIdentifiers.REQUEST_INVALID, message: "No matching connection ticket found" });
		}

		// todo: add ability to save/load json data to data store
		const parsedData = ConnectionTicketData.safeParse(JSON.parse(connectionTicketData));
		if (!parsedData.success) {
			throw new SystemError({ message: "No matching connection ticket found" });
		}
		const ticketData = parsedData.data;

		// Validate that this is a valid token for an existing connection
		if (existingConnection) {
			if (existingConnection.sessionId !== ticketData.sessionId || existingConnection.userId !== ticketData.userId) {
				// todo: custom error identifier/message in this situation?
				throw new AccessUnauthorizedError({ identifier: ErrorIdentifiers.REQUEST_INVALID, message: "No matching connection ticket found" });
			}
		}

		// todo: setup connection expiry and refresh mechanic at this point? or pass to websocket controller to do?

		return {
			connectionData: {
				userId: ticketData.userId,
				sessionId: ticketData.sessionId,
				expiry: ticketData.connectionExpiry,
			},
			// The connection should automatically join the room for its current user
			rooms: [`user-${ticketData.userId}`],
		};
	}

	async requestSubscriptions(userId: string, vaults: string[]): Promise<string[]> {
		for (const vaultId of vaults) {
			// todo: should this be done via the AccessControlService? can't be right now as doesn't have full RequestUser details
			// this is not checking access permissions for vaults too
			const vault = await this.vaultsService.get({ id: userId, sessionId: "", verifiedAt: "", role: "user" }, vaultId);
			if (vault.ownerId !== userId) {
				throw new AccessForbiddenError({
					userMessage: "You do not have the permissions required to perform this action.",
				});
			}
		}

		return vaults.map((vaultId) => `vault-${vaultId}`);
	}

	async sendAction(action: SyncAction): Promise<void> {
		if (!this.#actionCallback) {
			throw new SystemError({ message: "Attempted to send sync service action but not callback has been registered. This should have been done by the websocket controller." });
		}
		await this.#actionCallback(action);
	}

	async handleServerEvent(event: ServerEvent) {
		if (event.type === EventIdentifiers.AUTH_LOGOUT) {
			await this.sendAction({
				type: "disconnect-session",
				sessionId: event.detail.sessionId,
			});
		} else if (event.type === EventIdentifiers.USER_UPDATE) {
			await this.sendAction({
				type: "send-event",
				rooms: [`user-${event.detail.user.id}`],
				ignoreSessions: [event.detail.sessionId],
				event: event,
			});
		} else if (event.type === EventIdentifiers.USER_DELETE) {
			await this.sendAction({
				type: "send-event",
				rooms: [`user-${event.detail.userId}`],
				ignoreSessions: [event.detail.sessionId],
				event: event,
			});
			await this.sendAction({
				type: "disconnect-user",
				userId: event.detail.userId,
			});
			await this.sendAction({
				type: "delete-rooms",
				rooms: [`user-${event.detail.userId}`],
			});
		} else if (event.type === EventIdentifiers.VAULT_CREATE || event.type === EventIdentifiers.VAULT_UPDATE) {
			await this.sendAction({
				type: "send-event",
				rooms: [`user-${event.detail.vault.ownerId}`],
				ignoreSessions: [event.detail.sessionId],
				event: event,
			});
		} else if (event.type === EventIdentifiers.VAULT_DELETE) {
			await this.sendAction({
				type: "send-event",
				rooms: [`user-${event.detail.ownerId}`],
				ignoreSessions: [event.detail.sessionId],
				event: event,
			});
			await this.sendAction({
				type: "delete-rooms",
				rooms: [`vault-${event.detail.vaultId}`],
			});
		}
	}
}
