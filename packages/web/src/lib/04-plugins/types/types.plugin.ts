import {BasePlugin} from "@headbase-app/lib";
import type {PluginMetadata} from "@headbase-app/lib";
import {ContentTypesShelfItem} from "./types.shelf.ts";


export class TypesPlugin extends BasePlugin {
	meta: PluginMetadata = {
		id: "https://spec.headbase.app/v1/plugins/types",
		name: "Content Types",
		description: "A core plugin providing document type functionality.",
	}

	async load() {
		this.registerShelfItem(ContentTypesShelfItem)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
