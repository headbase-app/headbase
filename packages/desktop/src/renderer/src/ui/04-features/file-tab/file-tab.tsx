import {useCallback, useEffect, useRef} from "react";
import {useWorkspace} from "@ui/04-features/workspace/framework/use-workspace";
import {WithTabData} from "@ui/04-features/workspace/workspace";
import {useDependency} from "@framework/dependency.context";
import {MarkdownEditorPlugin} from "@ui/04-features/file-tab/form/editors/markdown-editor";
import {ImageViewerPlugin} from "@ui/04-features/file-tab/form/editors/image-viewer";
import {IFilesAPI} from "@api/files/files.interface";
import {PDFViewerPlugin} from "@ui/04-features/file-tab/form/editors/pdf-viewer";
import {Button} from "@ui/01-atoms/button/button";
import {UnsupportedViewerPlugin} from "@ui/04-features/file-tab/form/editors/unsupported-file";

export interface IPluginEditorProps {
	filePath: string
	container: HTMLDivElement
	setTabName: (name: string) => void
	setTabIsUnsaved: (isUnsaved: boolean) => void
	filesAPI: IFilesAPI
}

export interface IPluginEditorReturn {
	save: () => Promise<void>;
	unmount: () => Promise<void>;
}

export type IPluginEditor = (options: IPluginEditorProps) => Promise<IPluginEditorReturn>;

export interface FileTabProps extends WithTabData {
	filePath: string;
	editorChoice?: string;
}

type SaveAction = () => Promise<void>;

export function FileTab({filePath, editorChoice, tabIndex}: FileTabProps) {
	const { setTabName: _setTabName, setTabIsUnsaved: _setTabIsUnsaved } = useWorkspace()
	const { filesApi } = useDependency()

	const rootElement = useRef<HTMLDivElement>(null);
	const saveAction = useRef<SaveAction|null>(null)

	const setTabName = useCallback((name: string) => {
		_setTabName(tabIndex, name)
	}, [_setTabName, tabIndex])

	const setTabIsUnsaved = useCallback((isUnsaved: boolean) => {
		_setTabIsUnsaved(tabIndex, isUnsaved)
	}, [_setTabIsUnsaved, tabIndex])

	useEffect(() => {
		let cleanup
		let cleanupRan = false

		async function effect() {
			if (!rootElement.current) return

			// Get editor to user based on file.
			let editor: IPluginEditor;
			if (filePath.endsWith(".md")) {
				editor = MarkdownEditorPlugin
			}
			else if (filePath.endsWith(".pdf")) {
				editor = PDFViewerPlugin
			}
			else if (
				filePath.endsWith(".png") ||
				filePath.endsWith(".jpeg") ||
				filePath.endsWith(".jpg"))
			{
				editor = ImageViewerPlugin
			}
			else {
				editor = UnsupportedViewerPlugin
			}

			const {save, unmount} = await editor({
				container: rootElement.current,
				filePath,
				filesAPI: filesApi,
				setTabName,
				setTabIsUnsaved,
			})
			cleanup = () => {
				unmount()
			}

			if (cleanupRan) {
				unmount()
			}
			saveAction.current = save

		}
		effect()

		return () => {
			if (cleanup) {
				cleanup()
			}
			saveAction.current = null
			cleanupRan = true
		}
	}, [filePath, filesApi, setTabIsUnsaved, setTabName])

	function onSave() {
		if (saveAction.current) {
			console.debug('onsave')
			saveAction.current()
			setTabIsUnsaved(false)
		}
	}

	return (
		<>
			<Button onClick={onSave}>Save</Button>
			<div ref={rootElement} />
		</>
	)
}
