import {FileEditorPlugin} from "@headbase-app/libweb";

export class BasicMarkdownEditor extends FileEditorPlugin {
	filePath!: string
	container!: HTMLElement
	textarea!: HTMLTextAreaElement

	static isFileSupported(filePath: string) {
		return filePath.endsWith(".md");
	}

	async load(filePath: string, container: HTMLElement) {
		this.filePath = filePath
		this.container = container
		const fileContents = await this.apis.filesAPI.readAsText(filePath)

		this.textarea = document.createElement("textarea")
		this.textarea.value = fileContents

		container.append(this.textarea)
	}

	async save() {
		const text = this.textarea.value;
		await this.apis.filesAPI.writeText(this.filePath, text)
	}

	async close() {}
}
