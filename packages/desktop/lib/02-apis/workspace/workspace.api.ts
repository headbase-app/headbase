import {BehaviorSubject} from "rxjs";

export interface TabMetadata {
	id: string
	name: string
	isChanged: boolean
}
export type TabTypes = {
	type: 'search'
} | {
	type: 'file-explorer'
	path?: string
} | {
	type: 'content-types'
} | {
	type: 'file',
	path: string
}
export type WorkspaceTab = TabMetadata & TabTypes
export type WorkspaceTabs = WorkspaceTab[]

export interface OpenTabOptions {
	switch: boolean
}

export interface IWorkspaceAPI {
	// Queries
	liveQueryTabs: () => BehaviorSubject<WorkspaceTabs>
	liveQueryActiveTab: () => BehaviorSubject<string|null>
	// Actions
	openTab: (tab: TabTypes, options?: OpenTabOptions) => void
	replaceTab: (id: string, tab: TabTypes) => void
	closeTab: (id: string) => void
	closeAllTabs: () => void
	switchToTab: (tabId: string) => void
	// Metadata Actions
	updateTabMetadata: (tabId: string, update: Partial<Omit<TabMetadata, 'id'>>) => void
}
