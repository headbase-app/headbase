import {BasePlugin} from "@headbase-app/lib";
import type {PluginMetadata} from "@headbase-app/lib";
import {ContentTypesShelfItem} from "./content-types.shelf.ts";


export class ContentTypesPlugin extends BasePlugin {
	meta: PluginMetadata = {
		id: "https://spec.headbase.app/v1/plugins/content-types",
		name: "Content Types",
		description: "A core plugin providing content type functionality.",
	}

	async load() {
		this.registerShelfItem(ContentTypesShelfItem)
	}

	async unload() {
		// todo: remove all registered plugins?
	}
}
