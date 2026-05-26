import {
	FileEditorMetadata, FileEditorPlugin,
} from "../../../../../02-apis/plugin/plugin.api";


export class ImageViewer extends FileEditorPlugin {
	static meta: FileEditorMetadata = {
		id: "headbase--image-viewer",
		name: "Image Viewer",
		description: "Provides support for viewing images",
		supportedExtensions: [
			".apng", ".avif", ".gif",
			".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp",
			".png", ".svg", ".webp"
		],
	}

	image!: HTMLImageElement

	async load() {
		const url = await this.apis.filesAPI.readAsUrl(this.filePath)
		this.image = document.createElement("img")
		this.image.src = url
		this.container.append(this.image)
	}

	async unload() {
		this.container.removeChild(this.image)
	}
}
