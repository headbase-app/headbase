import {SourcePlugin} from "@headbase-app/lib";

import {FileEditorMetadata, FileEditorPlugin} from "../../../02-apis/plugin/plugins/editor-plugin.ts";
import {ViewConfig} from "./view.ts";


export class ViewEditor extends FileEditorPlugin {
	static meta: FileEditorMetadata = {
		id: "https://spec.headbase.app/v1/editor/views",
		name: "Headbase Views",
		description: "Provides support for Headbase .hb files which contain data views.",
		supportedExtensions: [".hb"],
	}

	async load() {
		const result = await this.apis.filesAPI.readAsText(this.filePath)
		const strippedText = result.text.replaceAll("\n", "").replaceAll("\t", "");

		let viewConfig: ViewConfig
		try {
			const json = JSON.parse(strippedText)
			viewConfig = ViewConfig.parse(json)
		}
		catch (e) {
			throw new Error("View data failed validation and appears invalid.", {cause: e})
		}

		const sources: SourcePlugin[] = []
		for (const source of viewConfig.sources) {
			const SourceClass = await this.apis.pluginAPI.getSourceById(source.type)
			if (!SourceClass) {
				alert(`Plugin for data source '${source.type}' not found'`)
				continue;
			}

			const sourceInstance = new SourceClass(this.apis, source.settings, source.query)
			sources.push(sourceInstance)
		}
		if (sources.length === 0) {
			alert(`No source plugins could be loaded`)
			return;
		}

		const ViewClass = await this.apis.pluginAPI.getViewById(viewConfig.view.type)
		if (!ViewClass) {
			alert(`Plugin for view '${viewConfig.view.type}' not found'`)
			return;
		}

		const viewInstance = new ViewClass(this.apis, this.container, sources)
		await viewInstance.load(viewConfig.view.settings)
	}

	async save() {
		console.debug(".hb save not implemented yet.")
	}

	async unload() {
		console.debug(".hb unload not implemented yet.")
	}
}
