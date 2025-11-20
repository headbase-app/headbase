import type {IPluginEditorProps, IPluginEditorReturn} from "@ui/03-features/file-editor/file-editor-tab.tsx";

export async function ImageViewer({ vaultId, apis, filePath, container }: IPluginEditorProps): Promise<IPluginEditorReturn> {
	const file = await apis.files.read(vaultId, filePath)

	const blob = new Blob([file.buffer])
	const url = URL.createObjectURL(blob)
	const image = document.createElement("img")
	image.src = url;
	image.style.maxWidth = "100%";
	image.style.height = "auto"
	container.append(image)

	async function unmount() {
		container.removeChild(image)
		URL.revokeObjectURL(url)
	}

	return {unmount}
}
