import {
	FileEditorPlugin,
	FileEditorMetadata,
} from "../../../../../02-apis/plugin/plugin.api";


export class BasicMarkdownEditor extends FileEditorPlugin {
	static meta: FileEditorMetadata = {
		id: "headbase--basic-markdown",
		name: "Basic Markdown Editor",
		description: "Provides basic editing support for markdown files",
		icon: "markdown",
		supportedExtensions: [".md"],
	}

	textarea!: HTMLTextAreaElement

	async load() {
		const fileContents = await this.apis.filesAPI.readAsText(this.filePath)
		this.textarea = document.createElement("textarea")
		this.textarea.value = fileContents
		this.container.append(this.textarea)
	}

	async save() {
		await this.apis.filesAPI.writeText(this.filePath, this.textarea.value)
	}

	async unload() {
		this.container.removeChild(this.textarea)
	}
}
