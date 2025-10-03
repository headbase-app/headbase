import {DeviceContext} from "@api/device/device.interface";

export const EventTypes = {
	// File System Events
	FILE_SYSTEM_CHANGE: "file-system-change",
	// History Event
	HISTORY_CHANGE: "history-change",
	// Database Events
	DATABASE_OPEN: 'database-open',
	DATABASE_CLOSE: 'database-close',
	DATABASE_CHANGE: 'database-change',
	// Other Events
	STORAGE_PERMISSION: 'storage-permission',
	// User Events
	USER_LOGIN: 'user-login',
	USER_LOGOUT: 'user-logout',
} as const

export interface HistoryChangeEvent {
	type: typeof EventTypes.HISTORY_CHANGE,
	detail: {
		context: DeviceContext,
		data: {
			vaultId: string
			action: 'save' |'delete-version' | 'delete-file'
			id: string,
			versionId: string
		}
	}
}

export interface FileSystemChangeEvent {
	type: typeof EventTypes.FILE_SYSTEM_CHANGE,
	detail: {
		context: DeviceContext,
		data: {
			vaultId: string
			action: 'save' | 'delete'
			path: string,
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
			user: unknown
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
	FileSystemChangeEvent | HistoryChangeEvent |
	DatabaseOpenEvent | DatabaseCloseEvent | DatabaseChangeEvent |
	StoragePermissionEvent |
	UserLoginEvent | UserLogoutEvent

export interface EventMap {
	// File System Events
	[EventTypes.FILE_SYSTEM_CHANGE]: FileSystemChangeEvent,
	// History Events
	[EventTypes.HISTORY_CHANGE]: HistoryChangeEvent,
	// Database Events
	[EventTypes.DATABASE_OPEN]: DatabaseOpenEvent,
	[EventTypes.DATABASE_CLOSE]: DatabaseCloseEvent,
	[EventTypes.DATABASE_CHANGE]: DatabaseChangeEvent,
	// Other Events
	[EventTypes.STORAGE_PERMISSION]: StoragePermissionEvent,
	// User Events
	[EventTypes.USER_LOGIN]: UserLoginEvent,
	[EventTypes.USER_LOGOUT]: UserLogoutEvent,
}
export type EventTypes = keyof EventMap
