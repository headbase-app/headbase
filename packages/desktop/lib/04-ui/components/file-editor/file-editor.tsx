import {createSignal, onMount, Show, type JSXElement, onCleanup} from "solid-js";
import {FileEditorPlugin, FileEditorPluginClass} from "../../../02-apis/plugin/plugin.api.ts";
import {useDeviceAPI} from "../../../03-framework/device.context";
import {useFilesAPI} from "../../../03-framework/files-api.context";
import {usePluginsAPI} from "../../../03-framework/plugins.context";

export interface FileEditorProps {
	filePath: string
}

export function FileEditor(props: FileEditorProps) {
	const deviceAPI = useDeviceAPI()
	const filesAPI = useFilesAPI()
	const pluginAPI = usePluginsAPI()

	let container!: HTMLDivElement
	const [message, setMessage] = createSignal<JSXElement|null>(null)
	const [editor, setEditor] = createSignal<FileEditorPlugin | null>(null)

	onMount(async () => {
		// todo: order/priority available editors and allow multiple with user selection?
		const allEditors = await pluginAPI.getEditors()
		const supportedEditors: FileEditorPluginClass[] = []
		for (const editor of allEditors) {
			if (!editor.meta) {
				console.error("Plugin missing metadata, ignoring", editor)
				continue;
			}

			for (const supportedExtension of editor.meta.supportedExtensions) {
				if (props.filePath.endsWith(supportedExtension)) {
					supportedEditors.push(editor)
					break;
				}
			}
		}

		if (supportedEditors.length === 0) {
			setMessage(
				<>
					<p><b>{filesAPI.getFileName(props.filePath)}</b>: No supported editors to found for files of this type.</p>
					<p>You could search for community plugins, raise a feature request or create your own custom plugin.</p>
				</>
			)
			return;
		}
		if (supportedEditors.length > 1) {
			setMessage(
				<>
					<p><b>{filesAPI.getFileName(props.filePath)}</b>: Multiple editors found for file of this type.</p>
					<p>Defaulting to first plugin found.</p>
				</>
			)
		}

		const plugin = supportedEditors[0];
		const instance = new plugin({deviceAPI, filesAPI}, container, props.filePath)
		await instance.load()
		setEditor(instance)
	})

	async function onSave() {
		const instance = editor()
		if (!instance) {
			return alert("Attempted to save file but active editor could not be found.")
		}

		if (instance.save) {
			await instance.save();
			alert("File saved")
		}
		else {
			return alert("Attempted to save file but active editor does not support this.")
		}
	}

	onCleanup(async () => {
		editor()?.unload()
		// todo: should force remove container contents too just in case?
	})

	return (
		<div>
			<Show when={editor()?.save}>
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
