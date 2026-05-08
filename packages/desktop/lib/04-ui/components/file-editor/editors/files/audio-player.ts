import type {
	FilePlugin,
	FilePluginEditorMethods,
	FilePluginEditorProps
} from "../../../../../02-apis/plugin/file-plugin";
import {PLUGIN_TYPES} from "../../../../../02-apis/plugin/plugin.api";


async function AudioPlayer({document, apis, filePath, container}: FilePluginEditorProps): Promise<FilePluginEditorMethods> {
	const url = await apis.filesAPI.readAsUrl(filePath)
	const audio = document.createElement("audio")
	audio.src = url
	audio.controls = true
	container.append(audio)

	async function close() {
		container.removeChild(audio)
	}

	return {
		close
	}
}

export const AudioPlayerPlugin: FilePlugin = {
	type: PLUGIN_TYPES.FILE,
	id: "headbase--audio-player",
	name: "Audio Player",
	description: "Provides support for playing audio files.",
	fileExtensions: [
		".mp3", ".m4a", ".m4b", ".flac", ".wav",
		".aac", ".ogg", ".wma",
		".aiff", ".alac", ".opus", ".dsd",
	],
	editor: AudioPlayer,
}
