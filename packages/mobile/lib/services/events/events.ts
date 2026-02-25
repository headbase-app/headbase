import type {DeviceContext} from "../../apis/device.api.ts";

export const EventTypes = {
	// Object Events
	FILE_CHANGE: "file-change",
	// Vault Events
	VAULT_OPEN: 'vault-open',
	VAULT_CLOSE: 'vault-close',
	VAULT_CHANGE: 'vault-change',
} as const

export interface FileChangeEvent {
	type: typeof EventTypes.FILE_CHANGE,
	detail: {
		context: DeviceContext,
		data: {
			vaultPath: string
			action: 'create' | 'update' | 'delete'
			filePath: string
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
			action: 'create' | 'update' | 'delete'
		}
	}
}

export type HeadbaseEvent = FileChangeEvent | VaultOpenEvent | VaultCloseEvent | VaultChangeEvent

export interface EventMap {
	// File Events
	[EventTypes.FILE_CHANGE]: FileChangeEvent,
	// Vault Events
	[EventTypes.VAULT_OPEN]: VaultOpenEvent,
	[EventTypes.VAULT_CLOSE]: VaultCloseEvent,
	[EventTypes.VAULT_CHANGE]: VaultChangeEvent,
}
export type EventTypes = keyof EventMap
