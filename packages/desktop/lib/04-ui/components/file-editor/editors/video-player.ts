import {
	FileEditorMetadata, FileEditorPlugin,
} from "../../../../02-apis/plugin/plugin.api.ts";

export class VideoPlayer extends FileEditorPlugin {
	static meta: FileEditorMetadata = {
		id: "headbase--video-player",
		name: "Video Player",
		description: "Provides support for playing video files.",
		supportedExtensions: [
			".mp4", ".mkv", ".webm"
		],
	}

	video!: HTMLVideoElement

	async load() {
		const url = await this.apis.filesAPI.readAsUrl(this.filePath)
		this.video = document.createElement("video")
		this.video.src = url
		this.video.controls = true
		this.container.append(this.video)
	}

	async unload() {
		this.container.removeChild(this.video)
	}
}
