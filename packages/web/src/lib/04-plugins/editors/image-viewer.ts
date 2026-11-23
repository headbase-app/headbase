import {type EditorMetadata, EditorPlugin} from "@headbase-app/lib";


export class ImageViewer extends EditorPlugin {
	static meta: EditorMetadata = {
		id: "https://spec.headbase.app/v1/editors/image",
		name: "Image Viewer",
		description: "Provides support for viewing image blobs.",
		supportedTypes: [
			"https://spec.headbase.app/v1/types/image"
		],
	}

	image!: HTMLImageElement
	url!: string

	async load() {
		const doc = await this.apis.databaseAPI.get(this.documentId!)
		if (!doc.blob) {
			alert(`Attempted to load image viewer for '${this.documentId}' but document has no blob data`);
			return;
		}

		const blob = new Blob([doc.blob.buffer as ArrayBuffer])
		this.url = URL.createObjectURL(blob)

		this.image = document.createElement("img")
		this.image.src = this.url
		this.container.append(this.image)
	}

	async unload() {
		if (this.url) {
			URL.revokeObjectURL(this.url)
		}
		this.container.removeChild(this.image)
	}
}
