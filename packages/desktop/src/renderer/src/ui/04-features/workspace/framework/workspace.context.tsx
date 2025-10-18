import {createContext} from "react";

export type WorkspaceTabTypes = {
	type: 'search'
} | {
	type: 'file-explorer'
} | {
	type: 'settings'
} | {
	type: 'file-new',
	editor?: string
} | {
	type: 'file',
	filePath: string
	editor?: string
}

export interface TabMetadata {
	name?: string,
	isUnsaved?: boolean
}

export type WorkspaceTab = WorkspaceTabTypes & TabMetadata

export interface OpenTabOptions {
	switch: boolean
}

export interface WorkspaceContext {
	tabs: WorkspaceTab[]
	openTab: (tab: WorkspaceTab, options?: OpenTabOptions) => void
	closeTab: (tabIndex: number) => void
	closeAllTabs: () => void
	replaceTab: (tabIndex: number, tab: WorkspaceTab) => void
	activeTab: number
	setActiveTab: (tabIndex: number) => void
	setTabIsUnsaved: (tabIndex: number, hasUnsaved: boolean) => void
	setTabName: (tabIndex: number, name: string) => void
}

const DefaultWorkspaceContext: WorkspaceContext = {
	tabs: [],
	openTab: () => {},
	closeTab: () => {},
	closeAllTabs: () => {},
	replaceTab: () => {},
	activeTab: 0,
	setActiveTab: () => {},
	setTabIsUnsaved: () => {},
	setTabName: () => {}
}

export const WorkspaceContext = createContext<WorkspaceContext>(DefaultWorkspaceContext)
