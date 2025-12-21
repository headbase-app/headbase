import {
	type OpenTabOptions,
	WorkspaceContext,
	type TabData,
	type WorkspaceTabs, type WorkspaceTabStates
} from "./workspace.context";
import {createSignal, type ParentProps} from "solid-js";
import {createStore} from "solid-js/store";

export function WorkspaceProvider(props: ParentProps) {
	const [tabs, setTabs] = createStore<WorkspaceTabs>([])
	const [tabsState, setTabsState] = createStore<WorkspaceTabStates>([])
	const [activeTabId, setActiveTabId] = createSignal<string | null>(null)

	function openTab(tabData: TabData, options?: OpenTabOptions) {
		// If object is already open, switch to it instead of opening a new instance.
		if (tabData.type === 'object') {
			const existingTab = tabs.find((tab) => tab.type === "object" && tab.objectId === tabData.objectId)
			if (existingTab) {
				setActiveTabId(existingTab.id)
				return;
			}
		}
		else if (tabData.type === 'types') {
			const existingTab = tabs.find((tab) => tab.type === "types")
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
		else if (tabData.type === 'types') {
			tabName = "Types"
		}
		else if (tabData.type === "object-new") {
			tabName = "New Object"
		}
		else {
			tabName = tabData.objectId
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
