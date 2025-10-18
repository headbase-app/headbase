import {createRoot, type Root} from "react-dom/client";
import {IEditorMountOptions, IEditorPlugin} from "@ui/04-features/file-tab/file-tab";
import {IFilesAPI} from "@api/files/files.interface";
import {MarkdownEditor} from "@ui/02-components/markdown-editor/markdown-editor";

export class MarkdownEditorPlugin implements IEditorPlugin {
	container?: HTMLDivElement
	reactRoot?: Root
	filesAPI: IFilesAPI
	content: string
	filePath?: string

	constructor(
		filesAPI: IFilesAPI,
	) {
		this.filesAPI = filesAPI
		this.content = ''
	}

	async mount(options: IEditorMountOptions) {
		this.filePath = options.filePath
		const file = await this.filesAPI.read(options.filePath)
		options.setTabName(file.fileName)

		const decoder = new TextDecoder()
		this.content = decoder.decode(file.buffer)

		this.reactRoot = createRoot(options.container)
		this.reactRoot.render(
			<MarkdownEditor
				initialValue={this.content}
				onChange={(value) => {this.content = value}}
			/>
		)
	}

	unmount() {
		if (this.reactRoot) {
			this.reactRoot.unmount()
		}

		this.filePath = undefined
	}

	async save() {
		if (!this.filePath) {
			throw new Error("Attempted to save with no file path")
		}

		const encoder = new TextEncoder()
		const encodedContent = encoder.encode(this.content)
		await this.filesAPI.write(this.filePath, encodedContent.buffer)
	}
}

