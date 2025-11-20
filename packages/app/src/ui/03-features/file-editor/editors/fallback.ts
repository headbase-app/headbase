import type {IPluginEditorProps, IPluginEditorReturn} from "@ui/03-features/file-editor/file-editor-tab.tsx";


export async function FallbackViewer({ vaultId, apis, filePath, container, setTabName }: IPluginEditorProps): Promise<IPluginEditorReturn> {
	const parts = filePath.split("/")
	const fileName = parts[parts.length - 1]
	setTabName(`${fileName} [unsupported]`)

	const messageContainer = document.createElement("div")
	const message = document.createElement("p")
	message.innerHTML = `<strong>${fileName}</strong> is not a file type which can currently be viewed or edited within Headbase.`

	const openExternal = document.createElement("button")
	openExternal.innerText = "Open External"
	openExternal.addEventListener("click", () => {
		apis.files.openExternal(vaultId, filePath)
	})

	messageContainer.appendChild(message)
	messageContainer.appendChild(openExternal)
	container.append(messageContainer)

	async function unmount() {
		container.removeChild(messageContainer)
	}

	return {unmount}
}
