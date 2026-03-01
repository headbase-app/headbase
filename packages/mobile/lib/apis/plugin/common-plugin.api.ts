import {type IPluginAPI} from "./plugin.api";
import {type AnyFilePlugin, FileEditorPlugin, FileEditorReadOnlyPlugin} from "./file-editor-plugins";

export class CommonPluginAPI implements IPluginAPI {
	private _fileEditors: AnyFilePlugin[] = []

	registerPlugin(plugin: AnyFilePlugin) {
		if (FileEditorPlugin.isPrototypeOf(plugin) || FileEditorReadOnlyPlugin.isPrototypeOf(plugin)) {
			console.debug(`[plugins] Registered file editor plugin: ${plugin.name}`)
			this._fileEditors.push(plugin)
		}
		else {
			console.warn(`Attempted to register plugin but not recognised: ${plugin.name}`)
		}
	}

	async getFileEditors() {
		return this._fileEditors
	}
}
