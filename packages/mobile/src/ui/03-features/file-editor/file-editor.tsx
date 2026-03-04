import {createSignal, onMount, Show, type JSXElement, onCleanup} from "solid-js";
import {usePluginsAPI} from "@framework/plugins.context.ts";
import {useFilesAPI} from "@framework/files-api.context.ts";
import {useDeviceAPI} from "@framework/device.context.ts";
import type {FilePlugin, FilePluginEditorMethods} from "@headbase-app/libweb";

export interface FileEditorProps {
	filePath: string
}

export function FileEditor(props: FileEditorProps) {
	const deviceAPI = useDeviceAPI()
	const filesAPI = useFilesAPI()
	const pluginAPI = usePluginsAPI()

	let container!: HTMLDivElement
	const [message, setMessage] = createSignal<JSXElement|null>(null)
	const [editorMethods, setEditorMethods] = createSignal<FilePluginEditorMethods | null>(null)

	onMount(async () => {
		// todo: order/priority available editors, allow multiple with user selection?
		const availableFilePlugins = await pluginAPI.getFilePlugins()
		let filePlugin: FilePlugin|null = null
		for (const plugin of availableFilePlugins) {
			for (const supportedExtension of plugin.fileExtensions) {
				if (props.filePath.endsWith(supportedExtension)) {
					filePlugin = plugin
					break;
				}
			}
		}

		if (filePlugin) {
			const pluginMethods = await filePlugin.editor({
				document: document,
				container,
				apis: {deviceAPI, pluginAPI, filesAPI},
				filePath: props.filePath,
			})
			setEditorMethods(pluginMethods)
		}
		else {
			setMessage(
				<>
					<p><b>{filesAPI.getFileName(props.filePath)}</b>: No supported editors to found for files of this type.</p>
					<p>You could search for community plugins, raise a feature request or create your own custom plugin.</p>
				</>
			)
		}
	})

	async function onSave() {
		const methods = editorMethods()
		if (!methods) {
			return alert("Attempted to save file but active editor could not be found.")
		}

		if (methods.save) {
			await methods.save();
			alert("File saved")
		}
		else {
			alert("Attempted to save file when active editor appears to be read-only.")
		}
	}

	onCleanup(async () => {
		await editorMethods()?.close()
		// todo: should force remove container contents too just in case?
	})

	return (
		<div>
			<Show when={editorMethods()?.save}>
				<div>
					<button onClick={onSave}>save</button>
				</div>
			</Show>
			<div ref={container} />
			<Show when={message()}>
				<p>{message()}</p>
			</Show>
		</div>
	)
}
