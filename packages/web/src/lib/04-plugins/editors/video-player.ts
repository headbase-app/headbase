import {type EditorMetadata, EditorPlugin} from "@headbase-app/lib";


export class VideoPlayer extends EditorPlugin {
	static meta: EditorMetadata = {
		id: "https://spec.headbase.app/v1/editors/video",
		name: "Video Player",
		description: "Provides support for playing video blobs.",
		supportedTypes: [
			"https://spec.headbase.app/v1/types/video"
		],
	}

	video!: HTMLVideoElement
	url!: string

	async load(documentId: string) {
		const doc = await this.apis.databaseAPI.get(documentId)
		if (!doc.blob) {
			alert(`Attempted to load video player for '${documentId}' but document has no blob data`);
			return;
		}

		const blob = new Blob([doc.blob.buffer as ArrayBuffer])
		this.url = URL.createObjectURL(blob)

		this.video = document.createElement("video")
		this.video.src = this.url
		this.video.controls = true
		this.container.append(this.video)
	}

	async unload() {
		if (this.url) {
			URL.revokeObjectURL(this.url)
		}
		this.container.removeChild(this.video)
	}
}
