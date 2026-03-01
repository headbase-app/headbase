import {createSignal, onMount, Show, type JSXElement, onCleanup} from "solid-js";
import {usePluginsAPI} from "@framework/plugins.context.ts";
import {useFilesAPI} from "@framework/files-api.context.ts";
import type {AnyFilePlugin} from "@headbase-app/libweb";
import {useDeviceAPI} from "@framework/device.context.ts";

export interface FileEditorProps {
	filePath: string
}

export function FileEditor(props: FileEditorProps) {
	const deviceAPI = useDeviceAPI()
	const filesAPI = useFilesAPI()
	const pluginAPI = usePluginsAPI()

	let container!: HTMLDivElement
	const [message, setMessage] = createSignal<JSXElement|null>(null)
	const [activeEditor, setActiveEditor] = createSignal<InstanceType<AnyFilePlugin> | null>(null)

	onMount(async () => {
		const editors = await pluginAPI.getFileEditors()
		// todo: order/priority available editors?
		const availableEditors = editors.filter(
			viewer => {
				// type assertion used to allow access to static 'isFileSupported' method type. todo: is there a better way here?
				return (viewer as unknown as InstanceType<AnyFilePlugin>).isFileSupported(props.filePath)
			}
		)
		const EditorPluginClass = availableEditors[0]

		if (EditorPluginClass) {
			const instance = new EditorPluginClass({
				deviceAPI, pluginAPI, filesAPI
			})
			await instance.load(props.filePath, container)
			setActiveEditor(instance)
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
		const editor = activeEditor()
		if (!editor) {
			return alert("Attempted to save file but active editor could not be found.")
		}

		if ('save' in editor) {
			const result = await editor.save();
			alert("File saved")
		}
		else {
			alert("Attempted to save file when active editor appears to be read-only.")
		}
	}

	onCleanup(async () => {
		await activeEditor()?.close()
		// todo: should force remove container contents too just in case?
	})

	return (
		<div>
			<Show when={'save' in (activeEditor() ?? {})}>
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
