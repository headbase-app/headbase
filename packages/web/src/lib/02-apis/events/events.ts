import type {DeviceContext} from "../device/device.api.js";
import type {WorkspaceItems} from "../workspace/workspace.api.ts";

export const EventTypes = {
	// Database Events
	DATABASE_OPEN: 'database-open',
	DATABASE_CLOSE: 'database-close',
	DATABASE_CHANGE: 'database-change',
	// Workspace Events
	WORKSPACE_CHANGE: 'workspace-change',
	WORKSPACE_ACTIVE_CHANGE: 'workspace-active-change',
} as const

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

export type HeadbaseEvent = DatabaseOpenEvent | DatabaseCloseEvent | DatabaseChangeEvent | WorkspaceChangeEvent | WorkspaceActiveChangeEvent

export interface EventMap {
	// Database Events
	[EventTypes.DATABASE_OPEN]: DatabaseOpenEvent,
	[EventTypes.DATABASE_CLOSE]: DatabaseCloseEvent,
	[EventTypes.DATABASE_CHANGE]: DatabaseChangeEvent,
	// Workspace Events
	[EventTypes.WORKSPACE_CHANGE]: WorkspaceChangeEvent,
	[EventTypes.WORKSPACE_ACTIVE_CHANGE]: WorkspaceActiveChangeEvent,
}
export type EventTypes = keyof EventMap
