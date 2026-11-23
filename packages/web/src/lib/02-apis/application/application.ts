import type {
	BasePluginClass,
	EditorPluginClass,
	IDeviceAPI, IWorkspaceAPI,
} from "@headbase-app/lib";
import type {IApplicationAPI} from "./application.api.ts";
import type {AppShelfPluginClass} from "../plugin/app-shelf-plugin/app-shelf-plugin.ts";
import type {WorkspacePluginClass} from "../plugin/workspace-plugin/workspace-plugin.ts";
import type {MatterWebProxy} from "@apis/matter-proxy.ts";


export class ApplicationAPI implements IApplicationAPI {
	constructor(
		private deviceAPI: IDeviceAPI,
		private workspaceAPI: IWorkspaceAPI,
		private databaseAPI: MatterWebProxy
	) {}

	#basePlugins: BasePluginClass[] = [];
	#editors: EditorPluginClass[] = []
	#shelfItems: AppShelfPluginClass[] = []
	#workspaceItems: WorkspacePluginClass[] = []

	registerPlugin(plugin: BasePluginClass)  {
		// todo: move somewhere that allows app control over core/external registration (protecting id namespace, validation etc)
		// this.#basePlugins.push(plugin);
		const instance = new plugin({deviceAPI: this.deviceAPI, workspaceAPI: this.workspaceAPI, databaseAPI: this.databaseAPI, applicationAPI: this});
		instance.registerPlugin = (plugin: BasePluginClass) => this.registerPlugin(plugin);
		instance.registerEditor = (editor) => this.#registerEditor(editor);
		instance.registerShelfItem = (shelfItem) => this.#registerShelfItem(shelfItem);
		instance.registerWorkspaceItem = (workspaceItem) => this.#registerWorkspaceItem(workspaceItem);
		instance.load()
	}

	#registerEditor(plugin: EditorPluginClass) {
		for (const editor of this.#editors) {
			if (editor.meta.id === plugin.meta.id) {
				throw new Error(`Editor with id ${plugin.meta.id} already found.`)
			}
			if (editor.meta.name === plugin.meta.name) {
				throw new Error(`Editor with name ${plugin.meta.name} already found. To avoid confusion, please use a different name.`)
			}
			// todo: protect against plugins using headbase id namespace/uri?
		}

		this.#editors.push(plugin)
	}

	async getEditors() {
		return this.#editors
	}

	async getEditorById(id: string) {
		return this.#editors.find(s => s.meta.id === id) ?? null
	}

	#registerShelfItem(plugin: AppShelfPluginClass) {
		for (const view of this.#shelfItems) {
			if (view.meta.id === plugin.meta.id) {
				throw new Error(`Shelf item with id ${plugin.meta.id} already found.`)
			}
			if (view.meta.name === plugin.meta.name) {
				throw new Error(`Shelf item with name ${plugin.meta.name} already found. To avoid confusion, please use a different name.`)
			}
			// todo: protect against plugins using headbase id namespace/uri?
		}

		this.#shelfItems.push(plugin)
	}

	async getShelfItems() {
		return this.#shelfItems
	}

	async getShelfById(id: string) {
		return this.#shelfItems.find(s => s.meta.id === id) ?? null
	}

	#registerWorkspaceItem(plugin: WorkspacePluginClass) {
		for (const view of this.#workspaceItems) {
			if (view.meta.id === plugin.meta.id) {
				throw new Error(`Workspace item with id ${plugin.meta.id} already found.`)
			}
			if (view.meta.name === plugin.meta.name) {
				throw new Error(`Workspace item with name ${plugin.meta.name} already found. To avoid confusion, please use a different name.`)
			}
			// todo: protect against plugins using headbase id namespace/uri?
		}

		this.#workspaceItems.push(plugin)
	}

	async getWorkspaceItems() {
		return this.#workspaceItems
	}

	async getWorkspaceItemById(id: string) {
		return this.#workspaceItems.find(s => s.meta.id === id) ?? null
	}
}
