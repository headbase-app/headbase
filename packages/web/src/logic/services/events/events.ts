import {UserDto} from "@headbase-app/common";
import {DeviceContext} from "../interfaces.ts";


export const EventTypes = {
	// Data Events
	DATA_CHANGE: 'data-change',
	// Database Events
	DATABASE_OPEN: 'database-open',
	DATABASE_CLOSE: 'database-close',
	DATABASE_UNLOCK: 'database-unlock',
	DATABASE_LOCK: 'database-lock',
	DATABASE_CHANGE: 'database-change',
	// Auth Events
	AUTH_LOGIN: 'auth-login',
	AUTH_LOGOUT: 'auth-logout',
	// Sync Events
	SYNC_STATUS: 'sync-status',
	SYNC_MESSAGE: 'sync-message',
	// Other Events
	STORAGE_PERMISSION: 'storage-permission',
	// User Events
	USER_LOGIN: 'user-login',
	USER_LOGOUT: 'user-logout',
} as const

export interface DataChangeEvent {
	type: typeof EventTypes.DATA_CHANGE,
	detail: {
		context: DeviceContext,
		data: {
			databaseId: string
			types: string[]
			action: 'create' | 'update' | 'delete' | 'purge' |  'create-version' | 'delete-version'
			id: string,
		}
	}
}

export interface DatabaseOpenEvent {
	type: typeof EventTypes.DATABASE_OPEN,
	detail: {
		context: DeviceContext,
		data: {
			id: string
		}
	}
}

export interface DatabaseCloseEvent {
	type: typeof EventTypes.DATABASE_CLOSE,
	detail: {
		context: DeviceContext,
		data: {
			id: string
		}
	}
}

export interface DatabaseUnlockEvent {
	type: typeof EventTypes.DATABASE_UNLOCK,
	detail: {
		context: DeviceContext,
		data: {
			id: string
		}
	}
}

export interface DatabaseLockEvent {
	type: typeof EventTypes.DATABASE_LOCK,
	detail: {
		context: DeviceContext,
		data: {
			id: string
		}
	}
}

export interface DatabaseChangeEvent {
	type: typeof EventTypes.DATABASE_CHANGE,
	detail: {
		context: DeviceContext,
		data: {
			id: string
			action: 'create' | 'update' | 'delete' | 'purge' | 'change-password'
		}
	}
}

export interface StoragePermissionEvent {
	type: typeof EventTypes.STORAGE_PERMISSION,
	detail: {
		context: DeviceContext,
		data: {
			isGranted: boolean
		}
	}
}

export interface UserLoginEvent {
	type: typeof EventTypes.USER_LOGIN,
	detail: {
		context: DeviceContext,
		data: {
			serverUrl: string
			user: UserDto
		}
	}
}

export interface UserLogoutEvent {
	type: typeof EventTypes.USER_LOGOUT,
	detail: {
		context: DeviceContext,
	}
}

export type HeadbaseEvent =
	DataChangeEvent |
	DatabaseOpenEvent | DatabaseCloseEvent | DatabaseChangeEvent |
	DatabaseUnlockEvent | DatabaseLockEvent

export interface EventMap {
	[EventTypes.DATA_CHANGE]: DataChangeEvent,
	[EventTypes.DATABASE_OPEN]: DatabaseOpenEvent,
	[EventTypes.DATABASE_CLOSE]: DatabaseCloseEvent,
	[EventTypes.DATABASE_UNLOCK]: DatabaseUnlockEvent,
	[EventTypes.DATABASE_LOCK]: DatabaseLockEvent,
	[EventTypes.DATABASE_CHANGE]: DatabaseChangeEvent,
	[EventTypes.STORAGE_PERMISSION]: StoragePermissionEvent,
	[EventTypes.USER_LOGIN]: UserLoginEvent,
	[EventTypes.USER_LOGOUT]: UserLogoutEvent,
}

export type EventTypes = keyof EventMap

// todo: simply event declarations and work better with built-in event emitter more.
export type AnyHeadbaseEvent =
	CustomEvent<UserLoginEvent['detail']> |
	CustomEvent<UserLogoutEvent['detail']> |
	CustomEvent<DataChangeEvent['detail']>