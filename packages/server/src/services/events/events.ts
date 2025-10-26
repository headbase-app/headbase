import {FileDto, ChunkDto, UserDto, VaultDto} from "@headbase-app/contracts";

export const EventIdentifiers = {
	// Auth Events
	AUTH_LOGIN: "auth-login",
	AUTH_LOGOUT: "auth-logout",
	// User Events
	USER_CREATE: "user-create",
	USER_UPDATE: "user-update",
	USER_DELETE: "user-delete",
	// Vaults Events
	VAULT_CREATE: "vault-create",
	VAULT_UPDATE: "vault-update",
	VAULT_DELETE: "vault-delete",
	// Files Events
	FILES_CREATE: "files-create",
	FILES_DELETE: "files-delete",
	// Files Events
	CHUNKS_CREATE: "chunks-create",
	CHUNKS_DELETE: "chunks-delete"
} as const

export interface AuthLoginEvent {
    type: typeof EventIdentifiers.AUTH_LOGIN,
    detail: {
        userId: string
        sessionId: string
    }
}
export interface AuthLogoutEvent {
    type: typeof EventIdentifiers.AUTH_LOGOUT,
    detail: {
        userId: string
        sessionId: string
    }
}

export interface UserCreateEvent {
    type: typeof EventIdentifiers.USER_CREATE,
    detail: {
        user: UserDto
    }
}
export interface UserUpdateEvent {
    type: typeof EventIdentifiers.USER_UPDATE,
    detail: {
        sessionId: string
        user: UserDto
    }
}
export interface UserDeleteEvent {
    type: typeof EventIdentifiers.USER_DELETE,
    detail: {
        sessionId: string
        userId: string
    }
}

export interface VaultCreateEvent {
    type: typeof EventIdentifiers.VAULT_CREATE,
    detail: {
        sessionId: string
        vault: VaultDto
    }
}
export interface VaultUpdateEvent {
    type: typeof EventIdentifiers.VAULT_UPDATE,
    detail: {
        sessionId: string
        vault: VaultDto
    }
}
export interface VaultDeleteEvent {
    type: typeof EventIdentifiers.VAULT_DELETE,
    detail: {
        sessionId: string
        vaultId: string
        // This is required to allow consumers to know what users to inform of this action
        ownerId: string
    }
}

export interface FileCreateEvent {
    type: typeof EventIdentifiers.FILES_CREATE,
    detail: {
        sessionId: string
        file: FileDto
    }
}
export interface FileDeleteEvent {
    type: typeof EventIdentifiers.FILES_DELETE,
    detail: {
        sessionId: string
        // This is required to allow consumers to know what vault this event occurred in
        vaultId: string
        id: string
    }
}

export interface ChunkCreateEvent {
	type: typeof EventIdentifiers.CHUNKS_CREATE,
	detail: {
		sessionId: string
		chunk: ChunkDto
	}
}
export interface ChunkDeleteEvent {
	type: typeof EventIdentifiers.CHUNKS_DELETE,
	detail: {
		sessionId: string
		// This is required to allow consumers to know what vault this event occurred in
		vaultId: string
		id: string
	}
}


export interface EventMap {
	// Auth events
	[EventIdentifiers.AUTH_LOGIN]: AuthLoginEvent,
	[EventIdentifiers.AUTH_LOGOUT]: AuthLogoutEvent,
	// User events
	[EventIdentifiers.USER_CREATE]: UserCreateEvent,
	[EventIdentifiers.USER_UPDATE]: UserUpdateEvent,
	[EventIdentifiers.USER_UPDATE]: UserUpdateEvent,
	// Vault events
	[EventIdentifiers.VAULT_CREATE]: VaultCreateEvent,
	[EventIdentifiers.VAULT_UPDATE]: VaultUpdateEvent,
	[EventIdentifiers.VAULT_DELETE]: VaultDeleteEvent,
	// Files events
	[EventIdentifiers.FILES_CREATE]: FileCreateEvent,
	[EventIdentifiers.FILES_DELETE]: FileDeleteEvent,
	// Chunk events
	[EventIdentifiers.CHUNKS_CREATE]: ChunkCreateEvent,
	[EventIdentifiers.CHUNKS_DELETE]: ChunkDeleteEvent,
}

export type ServerEvent =
  AuthLoginEvent | AuthLogoutEvent |
  UserCreateEvent | UserUpdateEvent | UserDeleteEvent |
  VaultCreateEvent | VaultUpdateEvent | VaultDeleteEvent |
  FileCreateEvent | FileDeleteEvent |
	ChunkCreateEvent | ChunkDeleteEvent
export type EventIdentifiers = keyof EventMap

export type ExternalServerEvent =
  UserUpdateEvent | UserDeleteEvent |
  VaultCreateEvent | VaultUpdateEvent | VaultDeleteEvent |
  FileCreateEvent | FileDeleteEvent |
	ChunkCreateEvent | ChunkDeleteEvent
