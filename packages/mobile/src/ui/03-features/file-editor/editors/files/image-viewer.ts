import {
	type FilePlugin,
	type FilePluginEditorProps,
	type FilePluginEditorMethods,
	PLUGIN_TYPES
} from "@headbase-app/libweb";


async function ImageViewer({document, apis, filePath, container}: FilePluginEditorProps): Promise<FilePluginEditorMethods> {
	const url = await apis.filesAPI.readAsUrl(filePath)
	const image = document.createElement("img")
	image.src = url
	container.append(image)

	async function close() {
		container.removeChild(image)
	}

	return {
		close
	}
}

export const ImageViewerPlugin: FilePlugin = {
	type: PLUGIN_TYPES.FILE,
	id: "headbase--image-viewer",
	name: "Image Viewer",
	description: "Provides support for viewing images",
	fileExtensions: [
		".apng", ".avif", ".gif",
		".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp",
		".png", ".svg", ".webp"
	],
	editor: ImageViewer,
}
