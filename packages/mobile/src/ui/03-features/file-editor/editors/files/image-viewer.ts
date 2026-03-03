import {
	type FilePlugin,
	type FilePluginProps,
	type FilePluginReturn,
	PLUGIN_TYPES
} from "@headbase-app/libweb";


async function ImageViewer({document, apis, filePath, container}: FilePluginProps): Promise<FilePluginReturn> {
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
	supportedExtensions: [
		".apng", ".avif", ".gif",
		".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp",
		".png", ".svg", ".webp"
	],
	run: ImageViewer,
}
