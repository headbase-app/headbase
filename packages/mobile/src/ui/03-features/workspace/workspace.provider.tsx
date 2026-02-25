import {createSignal, type ParentProps} from "solid-js";
import {createStore} from "solid-js/store";

import {
	type OpenTabOptions,
	WorkspaceContext,
	type TabData,
	type WorkspaceTabs, type WorkspaceTabStates
} from "./workspace.context.ts";
import {useFilesAPI} from "@framework/files-api.context.ts";


export function WorkspaceProvider(props: ParentProps) {
	const filesAPI = useFilesAPI()
	const [tabs, setTabs] = createStore<WorkspaceTabs>([])
	const [tabsState, setTabsState] = createStore<WorkspaceTabStates>([])
	const [activeTabId, setActiveTabId] = createSignal<string | null>(null)

	function openTab(tabData: TabData, options?: OpenTabOptions) {
		// If file is already open, switch to it instead of opening a new instance.
		if (tabData.type === 'file') {
			const existingTab = tabs.find((tab) => tab.type === "file" && tab.path === tabData.path)
			if (existingTab) {
				setActiveTabId(existingTab.id)
				return;
			}
		}
		else if (tabData.type === 'content-types') {
			const existingTab = tabs.find((tab) => tab.type === "content-types")
			if (existingTab) {
				setActiveTabId(existingTab.id)
				return;
			}
		}

		const id = window.crypto.randomUUID()
		let tabName: string;
		if (tabData.type === 'search') {
			tabName = "New Search"
		}
		else if (tabData.type === "file-explorer") {
			tabName = tabData.path ? filesAPI.getPathName(tabData.path) : "File Explorer"
		}
		else if (tabData.type === 'content-types') {
			tabName = "Content Types"
		}
		else if (tabData.type === "file-new") {
			tabName = "New File"
		}
		else {
			tabName = filesAPI.getPathName(tabData.path)
		}

		setTabs((currentTabs) => [
			...currentTabs,
			{...tabData, id},
		])
		setTabsState((currentTabs) => [
			...currentTabs,
			{
				id,
				name: tabName,
				isChanged: false
			},
		])

		// todo: will .length always be the most up to date signal value?
		if (typeof options?.switch === "undefined" || options.switch) {
			setActiveTabId(id)
		}
	}

	function closeTab(tabId: string) {
		setTabs((currentTabs) => {
			return currentTabs.filter(tab => tab.id !== tabId)
		})
		setTabsState((currentTabs) => {
			return currentTabs.filter(tab => tab.id !== tabId)
		})
	}

	function closeAllTabs() {
		setTabs([])
		setTabsState([])
	}

	function replaceTab(tabId: string, tabData: TabData) {
		setTabs((currentTabs) => {
			return currentTabs.map(existingTab => {
				if (existingTab.id === tabId) {
					return {id: tabId, ...tabData}
				}
				return existingTab
			})
		})
		setTabsState((currentTabs) => {
			return currentTabs.map(existingTab => {
				if (existingTab.id === tabId) {
					return {
						id: tabId,
						name: existingTab.name,
						isChanged: false
					}
				}
				return existingTab
			})
		})
	}

	function setTabIsChanged(tabId: string, isChanged: boolean) {
		setTabsState((currentTabs) => {
			return currentTabs.map(existingTab => {
				if (existingTab.id === tabId) {
					return {
						...existingTab,
						isChanged
					}
				}
				return existingTab
			})
		})
	}

	function setTabName(tabId: string, name: string) {
		setTabsState((currentTabs) => {
			return currentTabs.map(existingTab => {
				if (existingTab.id === tabId) {
					return {
						...existingTab,
						name
					}
				}
				return existingTab
			})
		})
	}


	return (
		<WorkspaceContext.Provider value={{
			tabs,
			tabsState,
			activeTabId,
			setActiveTabId,
			openTab,
			closeTab,
			closeAllTabs,
			replaceTab,
			setTabIsChanged,
			setTabName
		}}>
			{props.children}
		</WorkspaceContext.Provider>
	)
}
