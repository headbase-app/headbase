import {IPluginEditorProps, IPluginEditorReturn} from "@ui/04-features/file-tab/file-tab";

export async function UnsupportedViewerPlugin({ filePath, container, setTabName, filesAPI }: IPluginEditorProps): Promise<IPluginEditorReturn> {
	const parts = filePath.split("/")
	const fileName = parts[parts.length - 1]

	setTabName(`${fileName} [unsupported]`)

	const messageContainer = document.createElement("div")

	const message = document.createElement("p")
	message.innerHTML = `<strong>${fileName}</strong> is not a file type which can currently be viewed or edited within Headbase.`

	const openExternal = document.createElement("button")
	openExternal.innerText = "Open External"
	openExternal.addEventListener("click", () => {
		filesAPI.openExternal(filePath)
	})

	messageContainer.appendChild(message)
	messageContainer.appendChild(openExternal)

	container.append(messageContainer)

	async function save() {}

	async function unmount() {
		container.removeChild(messageContainer)
	}

	return {save, unmount}
}

