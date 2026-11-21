export interface WorkspaceItemMetadata {
	id: string
	name: string
	isChanged: boolean
}
export interface WorkspaceItemData {
	type: "plugin"
	plugin: string,
	data?: unknown[]
}

export type WorkspaceItem = WorkspaceItemMetadata & WorkspaceItemData
export type WorkspaceItems = WorkspaceItem[]

export interface WorkspaceOpenOptions {
	switch: boolean
}

export interface IWorkspaceAPI {
	// Queries
	getItems: () => WorkspaceItems
	getActiveItem: () => string | null
	// Actions
	open: (data: WorkspaceItemData, options?: WorkspaceOpenOptions) => void
	replace: (id: string, data: WorkspaceItemData) => void
	update: (id: string, update: Partial<Omit<WorkspaceItemMetadata, 'id'>>) => void
	close: (id: string) => void
	closeAll: () => void
	switch: (id: string) => void
}
