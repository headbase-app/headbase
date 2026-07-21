import {BaseElement, DataObject, PluginExposedAPIs, queryDataObjects} from "@headbase-app/lib";
import {html} from "lit-html";

import {FileEditorMetadata, FileEditorPlugin} from "../../../02-apis/plugin/plugins/editor-plugin.ts";
import {ViewConfig} from "./view.ts";


class HeadbaseView extends BaseElement {
	static tag = "hb-view-editor";
	filePath!: string;
	apis!: PluginExposedAPIs;
	results: DataObject[] = [];

	async connectedCallback() {
		super.connectedCallback();
		await this.loadData()
	}

	async loadData() {
		// todo: load and process once component is loaded/visible?
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

		this.results = []
		const sourceResults: DataObject[] = []
		for (const source of viewConfig.sources) {
			const SourceClass = await this.apis.pluginAPI.getSourceById(source.type)
			if (!SourceClass) {
				alert(`Plugin for data source '${source.type}' not found'`)
				return;
			}

			const instance = new SourceClass(this.apis)
			const results = await instance.query(source.settings)
			sourceResults.push(...results)

			if (source.query) {
				this.results = queryDataObjects(source.query, sourceResults)
			} else {
				this.results = sourceResults
			}
		}

		console.debug(this.results)
	}

	render() {
		return html`
			<p>View Editor</p>
		`
	}
}
customElements.define(HeadbaseView.tag, HeadbaseView)


export class ViewEditorPlugin extends FileEditorPlugin {
	static meta: FileEditorMetadata = {
		id: "https://spec.headbase.app/v1/editor/views",
		name: "Headbase Views",
		description: "Provides support for Headbase .hb files which contain data views.",
		supportedExtensions: [".hb"],
	}

	async load() {
		const editor = document.createElement('hb-view-editor')
		// @ts-ignore
		editor.filePath = this.filePath
		// @ts-ignore
		editor.apis = this.apis
		this.container.append(editor)
	}

	async save() {
		console.debug(".hb save not implemented yet.")
	}

	async unload() {}
}
