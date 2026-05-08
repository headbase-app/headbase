import type {
	FilePlugin,
	FilePluginEditorMethods,
	FilePluginEditorProps
} from "../../../../../02-apis/plugin/file-plugin";
import {PLUGIN_TYPES} from "../../../../../02-apis/plugin/plugin.api";


async function VideoPlayer({document, apis, filePath, container}: FilePluginEditorProps): Promise<FilePluginEditorMethods> {
	const url = await apis.filesAPI.readAsUrl(filePath)
	const video = document.createElement("video")
	video.src = url
	video.controls = true
	container.append(video)

	async function close() {
		container.removeChild(video)
	}

	return {
		close
	}
}

export const VideoPlayerPlugin: FilePlugin = {
	type: PLUGIN_TYPES.FILE,
	id: "headbase--video-player",
	name: "Video Player",
	description: "Provides support for playing video files.",
	fileExtensions: [
		".mp4", ".mkv", ".webm"
	],
	editor: VideoPlayer,
}
