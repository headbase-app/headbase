import {
	BasePluginClass,
	FileEditorPluginClass,
	IDeviceAPI,
	IFilesAPI, IWorkspaceAPI, ViewDisplayPluginClass,
	ViewSourcePluginClass
} from "@headbase-app/lib";
import {IApplicationAPI} from "./application.api.ts";
import {ShelfItemPluginClass} from "../plugin/plugins/shelf-item-plugin.ts";
import {WorkspaceItemPluginClass} from "../plugin/plugins/workspace-item-plugin.ts";


export class ApplicationAPI implements IApplicationAPI {
	constructor(
		private deviceAPI: IDeviceAPI,
		private filesAPI: IFilesAPI,
		private workspaceAPI: IWorkspaceAPI,
	) {}

	#basePlugins: BasePluginClass[] = [];
	#editors: FileEditorPluginClass[] = []
	#shelfItems: ShelfItemPluginClass[] = []
	#workspaceItems: WorkspaceItemPluginClass[] = []
	#viewSources: ViewSourcePluginClass[] = []
	#viewDisplays: ViewDisplayPluginClass[] = []

	registerPlugin(plugin: BasePluginClass)  {
		// todo: move somewhere that allows app control over core/external registration (protecting id namespace, validation etc)
		// this.#basePlugins.push(plugin);
		const instance = new plugin({deviceAPI: this.deviceAPI, filesAPI: this.filesAPI, workspaceAPI: this.workspaceAPI, applicationAPI: this});
		instance.registerPlugin = (plugin: BasePluginClass) => this.registerPlugin(plugin);
		instance.registerEditor = (editor) => this.#registerEditor(editor);
		instance.registerViewSource = (viewSource) => this.#registerViewSource(viewSource);
		instance.registerViewDisplay = (viewDisplay) => this.#registerViewDisplay(viewDisplay);
		instance.registerShelfItem = (shelfItem) => this.#registerShelfItem(shelfItem);
		instance.registerWorkspaceItem = (workspaceItem) => this.#registerWorkspaceItem(workspaceItem);
		instance.load()
	}

	#registerEditor(plugin: FileEditorPluginClass) {
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

	#registerViewSource(plugin: ViewSourcePluginClass) {
		for (const view of this.#viewSources) {
			if (view.meta.id === plugin.meta.id) {
				throw new Error(`View source with id ${plugin.meta.id} already found.`)
			}
			if (view.meta.name === plugin.meta.name) {
				throw new Error(`View source with name ${plugin.meta.name} already found. To avoid confusion, please use a different name.`)
			}
			// todo: protect against plugins using headbase id namespace/uri?
		}

		this.#viewSources.push(plugin)
	}

	async getViewSources() {
		return this.#viewSources
	}

	async getViewSourceById(id: string) {
		return this.#viewSources.find(s => s.meta.id === id) ?? null
	}

	#registerViewDisplay(plugin: ViewDisplayPluginClass) {
		for (const view of this.#viewDisplays) {
			if (view.meta.id === plugin.meta.id) {
				throw new Error(`View display with id ${plugin.meta.id} already found.`)
			}
			if (view.meta.name === plugin.meta.name) {
				throw new Error(`View display with name ${plugin.meta.name} already found. To avoid confusion, please use a different name.`)
			}
			// todo: protect against plugins using headbase id namespace/uri?
		}

		this.#viewDisplays.push(plugin)
	}

	async getViewDisplays() {
		return this.#viewDisplays
	}

	async getViewDisplayById(id: string) {
		return this.#viewDisplays.find(s => s.meta.id === id) ?? null
	}

	#registerShelfItem(plugin: ShelfItemPluginClass) {
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

	#registerWorkspaceItem(plugin: WorkspaceItemPluginClass) {
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
