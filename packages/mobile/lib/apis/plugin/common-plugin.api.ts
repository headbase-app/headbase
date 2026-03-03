import {type IPluginAPI, type Plugin, PLUGIN_TYPES} from "./plugin.api";
import type {FilePlugin} from "./file-plugin.ts";

export class CommonPluginAPI implements IPluginAPI {
	private _filePlugins: FilePlugin[] = []

	registerPlugin(plugin: Plugin) {
		console.debug(`[plugins] Registering plugin '${plugin.name}' (${plugin.id})`)

		for (const p of plugin.plugins) {
			if (p.type === PLUGIN_TYPES.FILE) {
				console.debug(`[plugins] Registered file plugin '${p.name}' (${p.id})`)
				this._filePlugins.push(p)
			}
			else {
				console.warn(`[plugins] Ignoring plugin '${p.name}' (${p.id}) with unknown type '${p.type}'`)
			}
		}
	}

	async getFilePlugins() {
		return this._filePlugins
	}
}
