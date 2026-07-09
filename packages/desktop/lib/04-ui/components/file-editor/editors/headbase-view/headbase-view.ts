import {BaseElement, IFilesAPI} from "@headbase-app/lib";
import {html, nothing, TemplateResult} from "lit-html";

import {FileEditorMetadata, FileEditorPlugin} from "../../../../../02-apis/plugin/plugins/editor-plugin.ts";


class HeadbaseView extends BaseElement {
	static tag = "hb-view-editor";
	path!: string;
	filesAPI!: IFilesAPI;

	async connectedCallback() {
		super.connectedCallback();

		const fileContents = await this.filesAPI.readAsText(this.path)
		console.debug(fileContents);
	}

	render(): TemplateResult | typeof nothing {
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
		editor.path = this.filePath
		// @ts-ignore
		editor.filesAPI = this.apis.filesAPI
		this.container.append(editor)
	}

	async save() {
		console.debug(".hb save not implemented yet.")
	}

	async unload() {}
}
