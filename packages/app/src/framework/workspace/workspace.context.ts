import {type Accessor, createContext, useContext} from "solid-js";

export type TabData = {
	type: 'search'
} | {
	type: 'file-explorer'
} | {
	type: 'file-new'
} | {
	type: 'file',
	filePath: string
}

export interface TabMetadata {
	id: string
	name: string,
	isChanged: boolean
}

export type WorkspaceTab = TabMetadata & TabData
export type WorkspaceTabs = WorkspaceTab[]

export interface OpenTabOptions {
	switch: boolean
}

export interface WorkspaceData {
	tabs: WorkspaceTabs
	activeTabId: Accessor<string | null>
	setActiveTabId: (tabId: string) => void
	openTab: (tabData: TabData, options?: OpenTabOptions) => void
	closeTab: (tabId: string) => void
	closeAllTabs: () => void
	replaceTab: (tabId: string, tabData: TabData) => void
	setTabIsChanged: (tabId: string, isChanged: boolean) => void
	setTabName: (tabId: string, name: string) => void
}

export const WorkspaceContext = createContext<WorkspaceData>();

export function useWorkspace() {
	const context = useContext(WorkspaceContext)
	if (!context) {
		throw new Error("Workspace context requested but no value was provided.")
	}

	return context
}
