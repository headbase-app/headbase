import {html} from "lit-html";
import {when} from "lit-html/directives/when.js";
import {createRef, ref} from "lit-html/directives/ref.js";

import {
	BaseElement,
	DeviceAPIContext, FileEditorPlugin,
	FileEditorPluginClass,
	FilesAPIContext,
	ApplicationAPIContext,
	useContext, WorkspaceAPIContext
} from "@headbase-app/lib";


export class FileEditor extends BaseElement {
	static tag = "hb-file-editor";

	// todo: useContext should no longer be used for features added via plugins
	deviceAPI = useContext(DeviceAPIContext)
	filesAPI = useContext(FilesAPIContext);
	applicationAPI = useContext(ApplicationAPIContext)
	workspaceAPI = useContext(WorkspaceAPIContext)

	container = createRef<HTMLDivElement>()
	filePath!: string
	editor?: FileEditorPlugin
	status: "loading" | "not-found" | "loaded" = "loading"

	async connectedCallback() {
		super.connectedCallback();

		// todo: plugin instantiation should be managed via ApplicationAPI
		const allEditors = await this.applicationAPI.getEditors();
		const supportedEditors: FileEditorPluginClass[] = []
		for (const editor of allEditors) {
			if (!editor.meta) {
				console.error("Plugin missing metadata, ignoring", editor)
				continue;
			}

			for (const supportedExtension of editor.meta.supportedExtensions) {
				if (this.filePath.endsWith(supportedExtension)) {
					supportedEditors.push(editor)
					break;
				}
			}
		}

		if (supportedEditors.length > 0) {
			const plugin = supportedEditors[0];
			this.editor = new plugin({deviceAPI: this.deviceAPI, filesAPI: this.filesAPI, workspaceAPI: this.workspaceAPI, applicationAPI: this.applicationAPI}, this, this.filePath)
			this.editor.filePath = this.filePath
			await this.editor.load()
			this.status = "loaded"
		}
		else {
			this.status = "not-found"
		}
		this.requestUpdate()
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
		let content;
		if (this.status === "loading") {
			content = html`
				<p>Loading editor...</p>
			`
		}
		else if (this.status === "not-found") {
			content = html`
				<p>No supported editor plugins found for this file type.</p>
			`
		}

		return html`
			<div>
				${when(
			this.editor,
			() => html`<button @click=${this.save.bind(this)}>save</button>`
		)}
				${content}
				<div ref=${ref(this.container)}></div>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[FileEditor.tag]: FileEditor
	}
}
