import {FileEditorMetadata, FileEditorPlugin} from "../../02-apis/plugin/plugins/editor-plugin.ts";


export class AudioPlayer extends FileEditorPlugin {
	static meta: FileEditorMetadata = {
		id: "https://spec.headbase.app/v1/editor/audio-player",
		name: "Audio Player",
		description: "Provides support for playing audio files.",
		supportedExtensions: [
			".mp3", ".m4a", ".m4b", ".flac", ".wav",
			".aac", ".ogg", ".wma",
			".aiff", ".alac", ".opus", ".dsd",
		],
	}

	audio!: HTMLAudioElement

	async load() {
		const file = await this.apis.filesAPI.readAsUrl(this.filePath)
		this.audio = document.createElement("audio")
		this.audio.src = file.url
		this.audio.controls = true
		this.container.append(this.audio)
	}

	async unload() {
		this.container.removeChild(this.audio)
	}
}
