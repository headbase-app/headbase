import {
	type IPluginStore,
	FileEditorPluginClass,
	ViewPluginClass, BasePluginClass
} from "./plugin.api";
import {IDeviceAPI} from "../device/device.api.ts";
import {IFilesAPI} from "../files/files.api.ts";

export class PluginStore implements IPluginStore {
	constructor(
		private deviceAPI: IDeviceAPI,
		private filesAPI: IFilesAPI,
	) {}

	#basePlugin: BasePluginClass[] = [];
	#editors: FileEditorPluginClass[] = []
	#views: ViewPluginClass[] = []

	registerBasePlugin(plugin: BasePluginClass)  {
		// todo: move somewhere that allows app control over core/external registration (protecting id namespace, validation etc)
		const instance = new plugin({deviceAPI: this.deviceAPI, filesAPI: this.filesAPI});
		instance.registerEditor = (editor) => this.#registerEditor(editor)
		instance.registerView = (view) => this.#registerView(view);
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

	#registerView(plugin: ViewPluginClass) {
		for (const view of this.#views) {
			if (view.meta.id === plugin.meta.id) {
				throw new Error(`View with id ${plugin.meta.id} already found.`)
			}
			if (view.meta.name === plugin.meta.name) {
				throw new Error(`View with name ${plugin.meta.name} already found. To avoid confusion, please use a different name.`)
			}
			// todo: protect against plugins using headbase id namespace/uri?
		}

		this.#views.push(plugin)
	}

	async getViews() {
		return this.#views
	}
}
