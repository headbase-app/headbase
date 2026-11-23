import {BasePlugin} from "@headbase-app/lib";
import type {PluginMetadata} from "@headbase-app/lib";
import {NewFileShelfItem} from "./new-file.shelf.ts";

export class NewFilePlugin extends BasePlugin {
	meta: PluginMetadata = {
		id: "https://spec.headbase.app/v1/plugins/new-file",
		name: "Create New File",
		description: "A core plugin providing the functionality to create a new file.",
	}

	async load() {
		this.registerShelfItem(NewFileShelfItem)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
