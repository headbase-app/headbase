import {onCleanup, createEffect} from "solid-js";

import type {IFilesAPI} from "@api/files/files.interface.ts";
import {useFilesAPI} from "@/framework/files.context.ts";
import {MarkdownEditor} from "@ui/03-features/file-editor/editors/basic-markdown.ts";
import {PDFViewer} from "@ui/03-features/file-editor/editors/pdf-viewer.ts";
import {ImageViewer} from "@ui/03-features/file-editor/editors/image-viewer.ts";
import {FallbackViewer} from "@ui/03-features/file-editor/editors/fallback.ts";
import {useWorkspace} from "@/framework/workspace/workspace.context.ts";
import {createStore} from "solid-js/store";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "@contracts/query.ts";
import type {LocalVaultDto} from "@api/vaults/local-vault.ts";
import {useCurrentVaultService} from "@/framework/current-vault.context.ts";


export interface IPluginEditorProps {
	// todo: remove need to know vaultId?
	vaultId: string;
	apis: {files: IFilesAPI}
	filePath: string
	container: HTMLDivElement
	setTabName: (name: string) => void,
	setTabIsChanged: (isChanged: boolean) => void,
}


export interface IPluginEditorReturn {
	save?: () => Promise<void>;
	unmount: () => Promise<void>;
}

export type IPluginEditor = (options: IPluginEditorProps) => Promise<IPluginEditorReturn>;

export interface FileEditorTabProps {
	tabId: string;
	filePath: string;
}

export function FileEditorTab(props: FileEditorTabProps) {
	const filesAPI = useFilesAPI()
	const currentVaultService = useCurrentVaultService()
	const { setTabName, setTabIsChanged } = useWorkspace()

	let container!: HTMLDivElement

	function _setTabName(name: string) {
		setTabName(props.tabId, name)
	}
	function _setTabIsChanged(isChanged: boolean) {
		setTabIsChanged(props.tabId, isChanged)
	}

	const [openVaultQuery, setOpenVaultQuery] = createStore<LiveQueryResult<LocalVaultDto|null>>(structuredClone(LIVE_QUERY_LOADING_STATE))
	createEffect(() => {
		const subscription = currentVaultService.liveGet((result) => {
			setOpenVaultQuery(result)
		})
		return () => {subscription.unsubscribe()}
	})
	const openVault = () => {return openVaultQuery.status === "success" ? openVaultQuery.result : null}

	let editorCleanup: () => void
	createEffect(async () => {
		const currentVault = openVault()
		if (!currentVault) return

		// Get editor to user based on file.
		let editor: IPluginEditor;
		if (props.filePath.endsWith(".md")) {
			editor = MarkdownEditor
		}
		else if (props.filePath.endsWith(".pdf")) {
			editor = PDFViewer
		}
		else if (
			props.filePath.endsWith(".png") ||
			props.filePath.endsWith(".jpeg") ||
			props.filePath.endsWith(".jpg")
		) {
			editor = ImageViewer
		}
		else {
			editor = FallbackViewer
		}

		const editorActions = await editor({
			apis: {files: filesAPI},
			vaultId: openVault()?.id!,
			container,
			filePath: props.filePath,
			setTabName: _setTabName,
			setTabIsChanged: _setTabIsChanged,
		})
		editorCleanup = editorActions.unmount
	})

	onCleanup(async () => {
		editorCleanup?.()
	})

	return (
		<div ref={container}></div>
	)
}
