import {IEditorMountOptions, IEditorPlugin} from "@ui/04-features/file-tab/file-tab";
import {IFilesAPI} from "@api/files/files.interface";

export class ImageViewerPlugin implements IEditorPlugin {
	container?: HTMLDivElement
	filesAPI: IFilesAPI
	imageElement?: HTMLImageElement
	url?: string

	constructor(
		filesAPI: IFilesAPI,
	) {
		this.filesAPI = filesAPI
	}

	async mount(options: IEditorMountOptions) {
		this.container = options.container

		const file = await this.filesAPI.read(options.filePath)
		//options.setTabName(file.fileName)

		const blob = new Blob([file.buffer])
		const url = URL.createObjectURL(blob)

		const image = document.createElement("img")
		image.src = url;
		image.style.maxWidth = "100%";
		image.style.height = "auto"

		options.container.append(image)
	}

	unmount() {
		if (this.imageElement && this.container) {
			this.container.removeChild(this.imageElement)
		}

		if (this.url) {
			URL.revokeObjectURL(this.url)
		}
	}

	async save() {}
}
