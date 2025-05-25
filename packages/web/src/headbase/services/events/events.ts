import {UserDto} from "@headbase-app/common";
import {DeviceContext} from "../../interfaces.ts";

export const EventTypes = {
	// Data Events
	FILE_SYSTEM_CHANGE: 'file-system-change',
	// Database Events
	DATABASE_OPEN: 'database-open',
	DATABASE_CLOSE: 'database-close',
	DATABASE_UNLOCK: 'database-unlock',
	DATABASE_LOCK: 'database-lock',
	DATABASE_CHANGE: 'database-change',
	// Other Events
	STORAGE_PERMISSION: 'storage-permission',
	// User Events
	USER_LOGIN: 'user-login',
	USER_LOGOUT: 'user-logout',
} as const


export interface FileSystemChangeEvent {
	type: typeof EventTypes.FILE_SYSTEM_CHANGE,
	detail: {
		context: DeviceContext,
		data: {
			vaultId: string
			path: string
			action: 'create' | 'delete'
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
	FileSystemChangeEvent |
	DatabaseOpenEvent | DatabaseCloseEvent | DatabaseUnlockEvent | DatabaseLockEvent | DatabaseChangeEvent |
	UserLoginEvent | UserLogoutEvent

export interface EventMap {
	[EventTypes.FILE_SYSTEM_CHANGE]: FileSystemChangeEvent,
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
