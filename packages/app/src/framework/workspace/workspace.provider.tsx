import {
	type OpenTabOptions,
	WorkspaceContext,
	type TabData,
	type WorkspaceTabs
} from "./workspace.context";
import {createSignal, type ParentProps} from "solid-js";
import {createStore} from "solid-js/store";

export function WorkspaceProvider(props: ParentProps) {
	const [tabs, setTabs] = createStore<WorkspaceTabs>([])
	const [activeTabId, setActiveTabId] = createSignal<string | null>(null)

	function openTab(tabData: TabData, options?: OpenTabOptions) {
		const id = window.crypto.randomUUID()

		setTabs((currentTabs) => [
			...currentTabs,
			{
				...tabData,
				id,
				name: tabData.type,
				isChanged: false
			},
		])

		// todo: is .length the most up to date value?
		if (typeof options?.switch === "undefined" || options.switch) {
			setActiveTabId(id)
		}
	}

	function closeTab(tabId: string) {
		setTabs((currentTabs) => {
			return currentTabs.filter(tab => tab.id !== tabId)
		})
	}

	function closeAllTabs() {
		setTabs([])
	}

	function replaceTab(tabId: string, tabData: TabData) {
		const id = window.crypto.randomUUID()

		setTabs((currentTabs) => {
			return currentTabs.map(existingTab => {
				if (existingTab.id === tabId) {
					return {
						...tabData,
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
		setTabs((currentTabs) => {
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
		setTabs((currentTabs) => {
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
