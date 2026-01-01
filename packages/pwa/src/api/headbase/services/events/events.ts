import type {DeviceContext} from "@api/headbase/services/device/device.interface.ts";

export const EventTypes = {
	// Object Events
	OBJECT_CHANGE: "object-change",
	VERSION_CHANGE: "version-change",
	// Database Events
	VAULT_OPEN: 'vault-open',
	VAULT_CLOSE: 'vault-close',
	VAULT_CHANGE: 'vault-change',
	// Other Events
	STORAGE_PERMISSION: 'storage-permission',
	// User Events
	USER_LOGIN: 'user-login',
	USER_LOGOUT: 'user-logout',
} as const

export interface ObjectChangeEvent {
	type: typeof EventTypes.OBJECT_CHANGE,
	detail: {
		context: DeviceContext,
		data: {
			vaultId: string
			types: string[]
			action: 'create' | 'update' | 'delete'
			id: string,
			versionId: string
		}
	}
}

export interface VersionChangeEvent {
	type: typeof EventTypes.VERSION_CHANGE,
	detail: {
		context: DeviceContext,
		data: {
			vaultId: string
			action: 'create' |'delete'
			id: string,
			objectId: string
		}
	}
}

export interface VaultOpenEvent {
	type: typeof EventTypes.VAULT_OPEN,
	detail: {
		context: DeviceContext,
		data: {
			id: string
		}
	}
}

export interface VaultCloseEvent {
	type: typeof EventTypes.VAULT_CLOSE,
	detail: {
		context: DeviceContext,
		data: {
			id: string
		}
	}
}

export interface VaultChangeEvent {
	type: typeof EventTypes.VAULT_CHANGE,
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
	ObjectChangeEvent | VersionChangeEvent |
	VaultOpenEvent | VaultCloseEvent | VaultChangeEvent |
	StoragePermissionEvent |
	UserLoginEvent | UserLogoutEvent

export interface EventMap {
	// Object Events
	[EventTypes.OBJECT_CHANGE]: ObjectChangeEvent,
	[EventTypes.VERSION_CHANGE]: VersionChangeEvent,
	// Vault Events
	[EventTypes.VAULT_OPEN]: VaultOpenEvent,
	[EventTypes.VAULT_CLOSE]: VaultCloseEvent,
	[EventTypes.VAULT_CHANGE]: VaultChangeEvent,
	// Other Events
	[EventTypes.STORAGE_PERMISSION]: StoragePermissionEvent,
	// User Events
	[EventTypes.USER_LOGIN]: UserLoginEvent,
	[EventTypes.USER_LOGOUT]: UserLogoutEvent,
}
export type EventTypes = keyof EventMap
