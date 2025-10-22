import {IPluginEditorProps, IPluginEditorReturn} from "@ui/04-features/file-tab/file-tab";

export async function ImageViewerPlugin({ filePath, container, filesAPI }: IPluginEditorProps): Promise<IPluginEditorReturn> {
	const file = await filesAPI.read(filePath)
	//options.setTabName(file.fileName)

	const blob = new Blob([file.buffer])
	const url = URL.createObjectURL(blob)

	const image = document.createElement("img")
	image.src = url;
	image.style.maxWidth = "100%";
	image.style.height = "auto"
	container.append(image)

	async function save() {}

	async function unmount() {
		container.removeChild(image)
		URL.revokeObjectURL(url)
	}

	return {save, unmount}
}

