import {type EditorMetadata, EditorPlugin} from "@headbase-app/lib";


export class AudioPlayer extends EditorPlugin {
	static meta: EditorMetadata = {
		id: "https://spec.headbase.app/v1/editors/audio",
		name: "Audio Player",
		description: "Provides support for playing audio blobs.",
		supportedTypes: [
			"https://spec.headbase.app/v1/types/audio"
		],
	}

	audio!: HTMLAudioElement
	url!: string

	async load(documentId: string) {
		const doc = await this.apis.databaseAPI.get(documentId)
		if (!doc.blob) {
			alert(`Attempted to load audio player for '${documentId}' but document has no blob data`);
			return;
		}

		const blob = new Blob([doc.blob.buffer as ArrayBuffer])
		this.url = URL.createObjectURL(blob)

		this.audio = document.createElement("audio")
		this.audio.src = this.url
		this.audio.controls = true
		this.container.append(this.audio)
	}

	async unload() {
		if (this.url) {
			URL.revokeObjectURL(this.url)
		}
		this.container.removeChild(this.audio)
	}
}
