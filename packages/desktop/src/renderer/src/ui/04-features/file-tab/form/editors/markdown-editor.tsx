import {createRoot} from "react-dom/client";
import {MarkdownEditor} from "@ui/02-components/markdown-editor/markdown-editor";
import {IPluginEditorProps, IPluginEditorReturn} from "@ui/04-features/file-tab/file-tab";

export async function MarkdownEditorPlugin({ filePath, container, filesAPI, setTabName, setTabIsUnsaved }: IPluginEditorProps): Promise<IPluginEditorReturn> {
	const file = await filesAPI.read(filePath)
	setTabName(file.fileName)

	const decoder = new TextDecoder()
	let content = decoder.decode(file.buffer)

	const reactRoot = createRoot(container)
	reactRoot.render(
		<MarkdownEditor
			initialValue={content}
			onChange={(value) => {
				setTabIsUnsaved(true)
				content = value
			}}
		/>
	)

	async function save() {
		const encoder = new TextEncoder()
		const encodedContent = encoder.encode(content)
		await filesAPI.write(filePath, encodedContent.buffer)
	}

	async function unmount() {
		// Adding setTimeout to remove react warning when unmounted nested root (https://github.com/facebook/react/issues/25675)
		setTimeout(() => {
			reactRoot.unmount()
		}, 0)
	}

	return {save, unmount}
}
