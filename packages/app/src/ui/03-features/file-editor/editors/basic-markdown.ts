import type {IPluginEditorProps, IPluginEditorReturn} from "@ui/03-features/file-editor/file-editor-tab.tsx";

export async function MarkdownEditor({ vaultId, apis, filePath, container, setTabIsChanged }: IPluginEditorProps): Promise<IPluginEditorReturn> {
	const file = await apis.files.read(vaultId, filePath)
	console.debug("MarkdownEditor load")

	const decoder = new TextDecoder()
	let content = decoder.decode(file.buffer)

	const editor = document.createElement("textarea")
	editor.value = content
	editor.oninput = (event => {
		// todo: use type assertion rather than checking for target?
		if (event.target) {
			setTabIsChanged(event.target.value !== content)
		}
	})

	container.append(editor)

	async function save() {
		const encoder = new TextEncoder()
		const encodedContent = encoder.encode(content)
		await apis.files.write(vaultId, filePath, encodedContent.buffer)
	}

	async function unmount() {
		container.removeChild(editor)
	}

	return {save, unmount}
}
