import {FileEditorReadOnlyPlugin} from "@headbase-app/libweb";

export class ImageViewer extends FileEditorReadOnlyPlugin {
	filePath!: string
	container!: HTMLElement

	static isFileSupported(filePath: string) {
		// todo: add path parsing to general FilesAPI?
		const parts = filePath.split(".")
		const extension = parts[parts.length-1]

		// Extensions copied from https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types#common_image_file_types
		return [
			"apng", "avif", "gif",
			"jpg", "jpeg", ".jfif", "pjpeg", "pjp",
			"png", "svg", "webp"
		].includes(extension)
	}

	async load(filePath: string, container: HTMLElement) {
		this.filePath = filePath
		this.container = container
		const url = await this.apis.filesAPI.readAsUrl(filePath)

		const image = document.createElement("img")
		image.src = url
		container.append(image)
	}

	async close() {}
}
