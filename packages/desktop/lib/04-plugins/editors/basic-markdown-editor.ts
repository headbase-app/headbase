import {FileEditorMetadata, FileEditorPlugin} from "../../02-apis/plugin/plugins/editor-plugin.ts";


export class BasicMarkdownEditor extends FileEditorPlugin {
	static meta: FileEditorMetadata = {
		id: "https://spec.headbase.app/v1/editor/basic-markdown",
		name: "Basic Markdown Editor",
		description: "Provides basic editing support for markdown files",
		icon: "markdown",
		supportedExtensions: [".md"],
	}

	textarea!: HTMLTextAreaElement

	async load() {
		const file = await this.apis.filesAPI.readAsText(this.filePath)
		this.textarea = document.createElement("textarea")
		this.textarea.value = file.text
		this.container.append(this.textarea)
	}

	async save() {
		await this.apis.filesAPI.writeText(this.filePath, this.textarea.value)
	}

	async unload() {
		this.container.removeChild(this.textarea)
	}
}
