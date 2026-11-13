import type {DeviceContext} from "../device/device.api.js";
import {WorkspaceItems} from "../workspace/workspace.api.ts";

export const EventTypes = {
	// Object Events
	FILE_CHANGE: "file-change",
	// Vault Events
	VAULT_OPEN: 'vault-open',
	VAULT_CLOSE: 'vault-close',
	VAULT_CHANGE: 'vault-change',
	// Workspace Events
	WORKSPACE_CHANGE: 'workspace-change',
	WORKSPACE_ACTIVE_CHANGE: 'workspace-active-change',
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

export interface WorkspaceChangeEvent {
	type: typeof EventTypes.WORKSPACE_CHANGE,
	detail: {
		context: DeviceContext,
		data: {
			items: WorkspaceItems
		}
	}
}

export interface WorkspaceActiveChangeEvent {
	type: typeof EventTypes.WORKSPACE_ACTIVE_CHANGE,
	detail: {
		context: DeviceContext,
		data: {
			activeItem: string|null
		}
	}
}

export type HeadbaseEvent = FileChangeEvent | VaultOpenEvent | VaultCloseEvent | VaultChangeEvent | WorkspaceChangeEvent | WorkspaceActiveChangeEvent

export interface EventMap {
	// File Events
	[EventTypes.FILE_CHANGE]: FileChangeEvent,
	// Vault Events
	[EventTypes.VAULT_OPEN]: VaultOpenEvent,
	[EventTypes.VAULT_CLOSE]: VaultCloseEvent,
	[EventTypes.VAULT_CHANGE]: VaultChangeEvent,
	// Workspace Events
	[EventTypes.WORKSPACE_CHANGE]: WorkspaceChangeEvent,
	[EventTypes.WORKSPACE_ACTIVE_CHANGE]: WorkspaceActiveChangeEvent,
}
export type EventTypes = keyof EventMap
