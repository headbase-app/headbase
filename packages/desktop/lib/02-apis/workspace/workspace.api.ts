import {BehaviorSubject} from "rxjs";

export interface WorkspaceItemMetadata {
	id: string
	name: string
	isChanged: boolean
}
export type WorkspaceItemTypes = {
	type: "plugin"
	plugin: string,
	data?: unknown
} | {
	type: "file",
	path: string
}
export type WorkspaceItem = WorkspaceItemMetadata & WorkspaceItemTypes
export type WorkspaceItems = WorkspaceItem[]

export interface WorkspaceOpenOptions {
	switch: boolean
}

export interface IWorkspaceAPI {
	// Queries
	getItems: () => WorkspaceItems
	getActiveItem: () => string | null
	// Actions
	open: (tab: WorkspaceItemTypes, options?: WorkspaceOpenOptions) => void
	replace: (id: string, tab: WorkspaceItemTypes) => void
	update: (tabId: string, update: Partial<Omit<WorkspaceItemMetadata, 'id'>>) => void
	close: (id: string) => void
	closeAll: () => void
	switch: (tabId: string) => void
}
