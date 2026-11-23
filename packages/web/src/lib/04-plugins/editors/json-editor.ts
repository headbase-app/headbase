import {type EditorMetadata, EditorPlugin} from "@headbase-app/lib";


export class JSONEditor extends EditorPlugin {
	static meta: EditorMetadata = {
		id: "https://spec.headbase.app/v1/editor/json",
		name: "JSON Editor",
		description: "Raw JSON editor, the fallback available for all document types.",
		icon: "json",
		supportsNew: true,
	}

	type!: HTMLInputElement
	textarea!: HTMLTextAreaElement

	async load() {
		this.type = document.createElement("input")
		this.textarea = document.createElement("textarea")

		if (this.documentId) {
			const doc = await this.apis.databaseAPI.get(this.documentId!)
			this.type.value = doc.type
			this.textarea.value = JSON.stringify(doc.data)
		}

		this.container.append(this.type)
		this.container.append(this.textarea)
	}

	async save() {
		try {
			const data = JSON.parse(this.textarea.value)

			if (this.documentId) {
				await this.apis.databaseAPI.update(this.documentId!, {type: this.type.value, data})
			}
			else {
				await this.apis.databaseAPI.create({type: this.type.value, data})
			}
		}
		catch (error) {
			console.error(error)
			alert("Failed to save data, likely the supplied raw JSON text is invalid.")
		}
	}

	async unload() {
		this.container.removeChild(this.textarea)
	}
}
