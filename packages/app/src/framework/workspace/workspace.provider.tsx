import {
	type OpenTabOptions,
	WorkspaceContext,
	type TabData,
	type WorkspaceTabs, type WorkspaceTabStates
} from "./workspace.context";
import {createSignal, type ParentProps} from "solid-js";
import {createStore} from "solid-js/store";
import {parsePath} from "opfsx"

export function WorkspaceProvider(props: ParentProps) {
	const [tabs, setTabs] = createStore<WorkspaceTabs>([])
	const [tabsState, setTabsState] = createStore<WorkspaceTabStates>([])
	const [activeTabId, setActiveTabId] = createSignal<string | null>(null)

	function openTab(tabData: TabData, options?: OpenTabOptions) {
		// If file is already open, switch to it instead of opening a new instance.
		if (tabData.type === 'file') {
			const existingTab = tabs.find((tab) => tab.type === "file" && tab.filePath === tabData.filePath)
			if (existingTab) {
				setActiveTabId(existingTab.id)
				return;
			}
		}

		const id = window.crypto.randomUUID()
		let tabName: string;
		if (tabData.type === 'search') {
			tabName = "Search"
		}
		else if (tabData.type === "file-explorer") {
			tabName = "File explorer"
		}
		else if (tabData.type === "file-new") {
			tabName = "New file"
		}
		else {
			const parsedPath = parsePath(tabData.filePath)
			tabName = parsedPath.name
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
		const id = window.crypto.randomUUID()

		setTabs((currentTabs) => {
			return currentTabs.map(existingTab => {
				if (existingTab.id === tabId) {
					return {...tabData, id}
				}
				return existingTab
			})
		})
		setTabsState((currentTabs) => {
			return currentTabs.map(existingTab => {
				if (existingTab.id === tabId) {
					return {
						id,
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
