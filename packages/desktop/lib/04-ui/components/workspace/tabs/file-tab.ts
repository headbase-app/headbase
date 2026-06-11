import {html, nothing, TemplateResult} from "lit-html";
import {createRef, ref} from "lit-html/directives/ref.js";
import {when} from "lit-html/directives/when.js";

import {
	BaseElement,
	DeviceAPIContext, FileEditorPlugin,
	FileEditorPluginClass,
	FilesAPIContext,
	PluginAPIContext,
	useContext
} from "@headbase-app/lib";

export class FileTab extends BaseElement {
	static tag = "hb-file-tab";

	deviceAPI = useContext(DeviceAPIContext)
	filesAPI = useContext(FilesAPIContext);
	pluginAPI = useContext(PluginAPIContext)

	path!: string
	container = createRef<HTMLDivElement>()
	editor?: FileEditorPlugin

	async connectedCallback() {
		super.connectedCallback();

		const allEditors = await this.pluginAPI.getEditors();
		const supportedEditors: FileEditorPluginClass[] = []
		for (const editor of allEditors) {
			if (!editor.meta) {
				console.error("Plugin missing metadata, ignoring", editor)
				continue;
			}

			for (const supportedExtension of editor.meta.supportedExtensions) {
				if (this.path.endsWith(supportedExtension)) {
					supportedEditors.push(editor)
					break;
				}
			}
		}

		if (supportedEditors.length > 0) {
			const plugin = supportedEditors[0];
			this.editor = new plugin({deviceAPI: this.deviceAPI, filesAPI: this.filesAPI}, this, this.path)
			await this.editor.load()
			this.requestUpdate()
		}
	}

	async save() {
		if (!this.editor) {
			return alert("Attempted to save when no editor active.")
		}
		if (!this.editor.save) {
			return alert("Attempted to save when active editor has noe save ability.")
		}

		await this.editor.save()
		alert("File saved")
	}

	render() {
		return html`
			<div>
				${when(
					!this.editor,
					() => html`<p>Loading editor...</p>`,
					() => html`<button @click=${this.save.bind(this)}>save</button>`
				)}
				<div ref=${ref(this.container)}></div>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[FileTab.tag]: FileTab
	}
}
