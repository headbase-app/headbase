import {EncryptionService, EventTypes, IDeviceAPI, IEventsService, IFilesAPI} from "@headbase-app/lib";
import {IWorkspaceAPI, WorkspaceOpenOptions, WorkspaceItemMetadata, WorkspaceItemTypes, WorkspaceItem, WorkspaceItems} from "./workspace.api.ts";

const WORKSPACE_TABS_STORAGE_KEY = "workspace-tabs"
const WORKSPACE_ACTIVE_TAB_STORAGE_KEY = "workspace-active-tab"

export class WorkspaceAPI implements IWorkspaceAPI {
	items: WorkspaceItems;
	activeItem: string|null;

	constructor(
		private eventsService: IEventsService,
		private deviceAPI: IDeviceAPI,
		private filesAPI: IFilesAPI,
	) {

		// todo: workspace tabs should be handled via storage API class, or workspace/WorkspaceVaultAPI combined?
		this.items = []
		const workspaceStorage = localStorage.getItem(WORKSPACE_TABS_STORAGE_KEY);
		if (workspaceStorage) {
			this.#setItems(JSON.parse(workspaceStorage))
		}

		this.activeItem = null
		const activeTabStorage = localStorage.getItem(WORKSPACE_ACTIVE_TAB_STORAGE_KEY);
		if (activeTabStorage) {
			this.#setActiveItem(JSON.parse(activeTabStorage));
		}
	}

	getItems() {
		return this.items;
	}
	getActiveItem() {
		return this.activeItem;
	}

	async #setItems(items: WorkspaceItem[]) {
		localStorage.setItem(WORKSPACE_TABS_STORAGE_KEY, JSON.stringify(items));
		this.items = items;

		const context = await this.deviceAPI.getCurrentContext()
		await this.eventsService.dispatch(EventTypes.WORKSPACE_CHANGE, {context, data: {items: items}})
	}
	async #setActiveItem(id: string|null) {
		localStorage.setItem(WORKSPACE_ACTIVE_TAB_STORAGE_KEY, JSON.stringify(id));
		this.activeItem = id;

		const context = await this.deviceAPI.getCurrentContext()
		await this.eventsService.dispatch(EventTypes.WORKSPACE_ACTIVE_CHANGE, {context, data: {activeItem: id}})
	}

	#getTabMetadataFromType(tab: WorkspaceItemTypes): WorkspaceItemMetadata {
		let name = tab.type === 'file'
			? this.filesAPI.parsePath(tab.path).base
			: "unknown plugin"

		return {
			id: EncryptionService.generateUUID(),
			name,
			isChanged: false,
		}
	}

	open(tab: WorkspaceItemTypes, options?: WorkspaceOpenOptions) {
		// If requested tab already exists, switch to it instead of opening a new instance.
		// todo: should allow plugins to be "single instance"?
		if (tab.type === 'file') {
			const existingTab = this.items.find((existingTab) => existingTab.type === "file" && existingTab.path === tab.path)
			if (existingTab) {
				this.switch(existingTab.id)
				return;
			}
		}

		const metadata = this.#getTabMetadataFromType(tab)
		this.#setItems([
			...this.items,
			{
				...tab,
				...metadata,
			}
		])
		if (!this.activeItem || options?.switch) {
			this.#setActiveItem(metadata.id)
		}
	}

	replace(id: string, tab: WorkspaceItemTypes) {
		// todo: check tab exists
		// todo: set name based on new rules?

		const updatedTabs = this.items.map((existingTab) => {
			if (existingTab.id !== id) return existingTab
			return {
				...tab,
				...this.#getTabMetadataFromType(tab)
			} satisfies WorkspaceItem
		})

		this.#setItems(updatedTabs);
	}

	close(id: string) {
		// todo: check tab exists
		// todo: if active tab, set active to next nearest tab?

		const updatedTabs = this.items.filter(tab => tab.id !== id)
		this.#setItems(updatedTabs);

		if (updatedTabs.length > 0) {
			this.#setActiveItem(null)
		}
	}

	closeAll() {
		this.#setItems([])
		this.#setActiveItem(null)
	}

	switch(id: string) {
		// todo: check tab exists
		this.#setActiveItem(id)
	}

	update(id: string, update: Partial<Omit<WorkspaceItemMetadata, 'id'>>) {
		// todo: check tab exists
		// todo: check update contains values

		const updatedTabs = this.items.map((existingTab) => {
			if (existingTab.id !== id) return existingTab
			return {
				...existingTab,
				...update,
			} satisfies WorkspaceItem
		})

		this.#setItems(updatedTabs)
	}
}
