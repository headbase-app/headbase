import {
	type IPluginStore,
} from "./plugin.api";
import {IDeviceAPI} from "../device/device.api.ts";
import {IFilesAPI} from "../files/files.api.ts";
import {FileEditorPluginClass} from "./plugins/editor-plugin.ts";
import {DataSourcePluginClass} from "./plugins/data-source-plugin.ts";
import {ViewPluginClass} from "./plugins/view-plugin.ts";
import {BasePluginClass} from "./plugins/base-plugin.ts";

export class PluginStore implements IPluginStore {
	constructor(
		private deviceAPI: IDeviceAPI,
		private filesAPI: IFilesAPI,
	) {}

	// #basePlugins: BasePluginClass[] = [];
	#editors: FileEditorPluginClass[] = []
	#dataSources: DataSourcePluginClass[] = []
	#viewDisplays: ViewPluginClass[] = []

	registerPlugin(plugin: BasePluginClass)  {
		// todo: move somewhere that allows app control over core/external registration (protecting id namespace, validation etc)
		// this.#basePlugins.push(plugin);
		const instance = new plugin({deviceAPI: this.deviceAPI, filesAPI: this.filesAPI});
		instance.registerEditor = (editor) => this.#registerEditor(editor);
		instance.registerViewSource = (viewSource) => this.#registerViewSource(viewSource);
		instance.registerViewDisplay = (viewDisplay) => this.#registerViewDisplay(viewDisplay);
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

	#registerViewSource(plugin: DataSourcePluginClass) {
		for (const view of this.#dataSources) {
			if (view.meta.id === plugin.meta.id) {
				throw new Error(`View source with id ${plugin.meta.id} already found.`)
			}
			if (view.meta.name === plugin.meta.name) {
				throw new Error(`View source with name ${plugin.meta.name} already found. To avoid confusion, please use a different name.`)
			}
			// todo: protect against plugins using headbase id namespace/uri?
		}

		this.#dataSources.push(plugin)
	}

	#registerViewDisplay(plugin: ViewPluginClass) {
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

	async getEditors() {
		return this.#editors
	}

	async getDataSources() {
		return this.#dataSources
	}

	async getViews() {
		return this.#viewDisplays
	}
}
