import {BasePlugin, BasePluginMetadata} from "../../../02-apis/plugin/base-plugin.ts";
import {ContentTypesShelfItem} from "./content-types.shelf.ts";


export class ContentTypesPlugin extends BasePlugin {
	meta: BasePluginMetadata = {
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
