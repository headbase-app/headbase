import {BehaviorSubject} from "rxjs";
import {EncryptionService, IFilesAPI} from "@headbase-app/lib";
import {IWorkspaceAPI, OpenTabOptions, TabMetadata, TabTypes, WorkspaceTab, WorkspaceTabs} from "./workspace.api.ts";

const WORKSPACE_TABS_STORAGE_KEY = "workspace-tabs"
const WORKSPACE_ACTIVE_TAB_STORAGE_KEY = "workspace-active-tab"

export class WorkspaceAPI implements IWorkspaceAPI {
	readonly #tabs$: BehaviorSubject<WorkspaceTabs>;
	readonly #activeTab$: BehaviorSubject<string|null>;

	constructor(
		private filesAPI: IFilesAPI,
	) {

		// todo: workspace tabs should be handled via storage API class, or workspace/WorkspaceVaultAPI combined?
		let savedTabs: WorkspaceTab[] = [];
		const workspaceStorage = localStorage.getItem(WORKSPACE_TABS_STORAGE_KEY);
		if (workspaceStorage) {
			savedTabs = JSON.parse(workspaceStorage);
		}

		let savedActiveTab: string | null = null;
		const activeTabStorage = localStorage.getItem(WORKSPACE_ACTIVE_TAB_STORAGE_KEY);
		if (activeTabStorage) {
			savedActiveTab = JSON.parse(activeTabStorage);
		}

		this.#tabs$ = new BehaviorSubject<WorkspaceTabs>(savedTabs)
		this.#activeTab$ = new BehaviorSubject<string|null>(savedActiveTab)
	}

	#setTabs(tabs: WorkspaceTab[]) {
		localStorage.setItem(WORKSPACE_TABS_STORAGE_KEY, JSON.stringify(tabs));
		this.#tabs$.next(tabs);
	}
	#setActiveTab(id: string|null) {
		localStorage.setItem(WORKSPACE_ACTIVE_TAB_STORAGE_KEY, JSON.stringify(id));
		this.#activeTab$.next(id);
	}

	liveQueryTabs() {
		return this.#tabs$
	}

	liveQueryActiveTab() {
		return this.#activeTab$
	}

	#getTabMetadataFromType(tab: TabTypes): TabMetadata {
		let name: string;
		if (tab.type === 'search') {
			name = "New Search"
		}
		else if (tab.type === "file-explorer") {
			name = tab.path ? this.filesAPI.parsePath(tab.path).base : "File Explorer"
		}
		else if (tab.type === 'content-types') {
			name = "Content Types"
		}
		else {
			name =  this.filesAPI.parsePath(tab.path).base
		}

		return {
			id: EncryptionService.generateUUID(),
			name,
			isChanged: false,
		}
	}

	openTab(tab: TabTypes, options?: OpenTabOptions) {
		// If requested tab already exists, switch to it instead of opening a new instance.
		if (tab.type === 'file') {
			const existingTab = this.#tabs$.value.find((existingTab) => existingTab.type === "file" && existingTab.path === tab.path)
			if (existingTab) {
				this.switchToTab(existingTab.id)
				return;
			}
		}
		else if (tab.type === 'content-types') {
			const existingTab = this.#tabs$.value.find((tab) => tab.type === "content-types")
			if (existingTab) {
				this.switchToTab(existingTab.id)
				return;
			}
		}

		const metadata = this.#getTabMetadataFromType(tab)
		this.#setTabs([
			...this.#tabs$.value,
			{
				...tab,
				...metadata,
			}
		])
		if (!this.#activeTab$.value || options?.switch) {
			this.#setActiveTab(metadata.id)
		}
	}

	replaceTab(id: string, tab: TabTypes) {
		// todo: check tab exists
		// todo: set name based on new rules?

		const updatedTabs = this.#tabs$.value.map((existingTab) => {
			if (existingTab.id !== id) return existingTab
			return {
				...tab,
				...this.#getTabMetadataFromType(tab)
			} satisfies WorkspaceTab
		})

		this.#setTabs(updatedTabs);
	}

	closeTab(id: string) {
		// todo: check tab exists
		// todo: if active tab, set active to next nearest tab?

		const updatedTabs = this.#tabs$.value.filter(tab => tab.id !== id)
		this.#setTabs(updatedTabs);
	}

	closeAllTabs() {
		this.#setTabs([])
		this.#setActiveTab(null)
	}

	switchToTab(id: string) {
		// todo: check tab exists
		this.#setActiveTab(id)
	}

	updateTabMetadata(id: string, update: Partial<Omit<TabMetadata, 'id'>>) {
		// todo: check tab exists
		// todo: check update contains values

		const updatedTabs = this.#tabs$.value.map((existingTab) => {
			if (existingTab.id !== id) return existingTab
			return {
				...existingTab,
				...update,
			} satisfies WorkspaceTab
		})

		this.#setTabs(updatedTabs)
	}
}
