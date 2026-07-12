import {IWorkspaceAPI, OpenTabOptions, TabMetadata, TabTypes, WorkspaceTab, WorkspaceTabs} from "./workspace.api.ts";
import {BehaviorSubject} from "rxjs";
import {EncryptionService, IFilesAPI} from "@headbase-app/lib";

export class WorkspaceAPI implements IWorkspaceAPI {
	#tabs$: BehaviorSubject<WorkspaceTabs>;
	#activeTab$: BehaviorSubject<string|null>;

	constructor(
		private filesAPI: IFilesAPI,
	) {
		this.#tabs$ = new BehaviorSubject<WorkspaceTabs>([])
		this.#activeTab$ = new BehaviorSubject<string|null>(null)
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
		this.#tabs$.next([
			...this.#tabs$.value,
			{
				...tab,
				...metadata,
			}
		])

		if (!this.#activeTab$.value || options?.switch) {
			this.#activeTab$.next(metadata.id)
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

		this.#tabs$.next(updatedTabs);
	}

	closeTab(id: string) {
		// todo: check tab exists
		// todo: if active tab, set active to next nearest tab?

		const updatedTabs = this.#tabs$.value.filter(tab => tab.id !== id)
		this.#tabs$.next(updatedTabs);
	}

	closeAllTabs() {
		this.#tabs$.next([])
		this.#activeTab$.next(null)
	}

	switchToTab(id: string) {
		// todo: check tab exists
		this.#activeTab$.next(id);
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

		this.#tabs$.next(updatedTabs);
	}
}
