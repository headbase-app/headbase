import {html} from "lit-html";
import {when} from "lit-html/directives/when.js";
import {createRef, ref} from "lit-html/directives/ref.js";

import {
	BaseElement,
	DeviceAPIContext, EditorPlugin,
	type EditorPluginClass,
	MatterDatabaseAPIContext,
	ApplicationAPIContext,
	useContext, WorkspaceAPIContext, type WorkspaceDocumentData
} from "@headbase-app/lib";


export class WorkspaceItemDocument extends BaseElement {
	static tag = "hb-workspace-item-document";
	item!: WorkspaceDocumentData;

	deviceAPI = useContext(DeviceAPIContext)
	workspaceAPI = useContext(WorkspaceAPIContext)
	applicationAPI = useContext(ApplicationAPIContext)
	databaseAPI = useContext(MatterDatabaseAPIContext)

	container = createRef<HTMLDivElement>()
	editor?: EditorPlugin
	status: "loading" | "not-found" | "loaded" = "loading"

	async connectedCallback() {
		super.connectedCallback();

		const supportedEditors: EditorPluginClass[] = []
		console.log(supportedEditors)

		let type: string | null = null;
		if (this.item.documentId) {
			const doc = await this.databaseAPI.get(this.item.documentId)
			type = doc.type
		}

		// todo: plugin instantiation should be managed via ApplicationAPI?
		const allEditors = await this.applicationAPI.getEditors();
		for (const editor of allEditors) {
			if (editor.meta.supportedTypes && type) {
				if (editor.meta.supportedTypes.includes(type)) {
					supportedEditors.push(editor);
				}
			}
			else if (editor.meta.supportsNew) {
				supportedEditors.push(editor)
			}
		}

		if (supportedEditors.length > 0) {
			const plugin = supportedEditors[0];
			this.editor = new plugin({deviceAPI: this.deviceAPI, databaseAPI: this.databaseAPI, workspaceAPI: this.workspaceAPI, applicationAPI: this.applicationAPI}, this, this.item.documentId)
			this.editor.documentId = this.item.documentId
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
				<p>No supported editor plugins found for this document type.</p>
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
		[WorkspaceItemDocument.tag]: WorkspaceItemDocument
	}
}
