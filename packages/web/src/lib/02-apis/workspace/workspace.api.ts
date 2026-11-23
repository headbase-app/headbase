export interface WorkspaceItemMetadata {
	id: string
	name: string
	isChanged: boolean
}

export interface WorkspacePluginType {
	type: "plugin"
	plugin: string,
	data?: unknown[]
}
export type WorkspacePluginData = WorkspaceItemMetadata & WorkspacePluginType

export interface WorkspaceDocumentType {
	type: "document"
	documentId?: string
}
export type WorkspaceDocumentData = WorkspaceItemMetadata & WorkspaceDocumentType

export type WorkspaceItemTypes = WorkspacePluginType | WorkspaceDocumentType

export type WorkspaceItem = WorkspacePluginData | WorkspaceDocumentData
export type WorkspaceItems = WorkspaceItem[]

export interface WorkspaceOpenOptions {
	switch: boolean
}

export interface IWorkspaceAPI {
	// Queries
	getItems: () => WorkspaceItems
	getActiveItem: () => string | null
	// Actions
	open: (data: WorkspaceItemTypes, options?: WorkspaceOpenOptions) => void
	replace: (id: string, data: WorkspaceItemTypes) => void
	update: (id: string, update: Partial<Omit<WorkspaceItemMetadata, 'id'>>) => void
	close: (id: string) => void
	closeAll: () => void
	switch: (id: string) => void
}
