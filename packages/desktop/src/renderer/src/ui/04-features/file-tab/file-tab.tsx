import {useCallback, useEffect, useRef} from "react";
import {useWorkspace} from "@ui/04-features/workspace/framework/use-workspace";
import {WithTabData} from "@ui/04-features/workspace/workspace";
import {useDependency} from "@framework/dependency.context";
import {MarkdownEditorPlugin} from "@ui/04-features/file-tab/form/editors/markdown-editor";
import {ImageViewerPlugin} from "@ui/04-features/file-tab/form/editors/image-viewer";

export interface IEditorMountOptions {
	filePath: string
	container: HTMLDivElement
	setTabName: (name: string) => void
	setTabIsUnsaved: (isUnsaved: boolean) => void
}

export interface IEditorPlugin {
	mount: (options: IEditorMountOptions) => Promise<void>;
	unmount: () => void
	save: () => Promise<void>
}


export interface FileTabProps extends WithTabData {
	filePath: string;
	editorChoice?: string;
}

export function FileTab({filePath, editorChoice, tabIndex}: FileTabProps) {
	const { setTabName: _setTabName, setTabIsUnsaved: _setTabIsUnsaved } = useWorkspace()
	const { filesApi } = useDependency()
	const rootElement = useRef<HTMLDivElement>(null);

	const setTabName = useCallback((name: string) => {
		_setTabName(tabIndex, name)
	}, [_setTabName, tabIndex])

	const setTabIsUnsaved = useCallback((isUnsaved: boolean) => {
		_setTabIsUnsaved(tabIndex, isUnsaved)
	}, [_setTabIsUnsaved, tabIndex])

	useEffect(() => {
		let activeEditor: IEditorPlugin
		const container = rootElement.current
		let effectContainer: HTMLDivElement
		let cleanupRan = false

		async function effect() {
			if (!rootElement.current) return

			// Create unique container for the effect so mount/unmount can run without effecting future hook runs.
			effectContainer = document.createElement("div")
			rootElement.current.append(effectContainer)

			// if (editorChoice) {
			// 	activeEditor = pluginAPI.getEditor(editorChoice)
			// 	if (!activeEditor) {
			// 		throw new Error("Could not find editor choice.")
			// 	}
			// }
			// else {
			// 	activeEditor = pluginAPI.getEditorSuggestion(filePath)
			// }
			//
			// if (!activeEditor) {
			// 	throw new Error("Could not find editor for given file.")
			// }
			if (filePath.endsWith(".md")) {
				activeEditor = new MarkdownEditorPlugin(filesApi)
			}
			else if (
				filePath.endsWith(".png") ||
				filePath.endsWith(".jpeg") ||
				filePath.endsWith(".jpg"))
			{
				activeEditor = new ImageViewerPlugin(filesApi)
			}
			else {
				throw new Error("File is not supported")
			}

			activeEditor.mount({
				filePath,
				container: effectContainer,
				setTabName,
				setTabIsUnsaved
			})

			// React may clean up before async plugin is loaded, for example in strict mode, so if cleanup has already ran then retroactively run plugin cleanup
			if (cleanupRan) {
				// setTimeout to prevent React error, see https://github.com/facebook/react/issues/25675.
				setTimeout(() => {
					activeEditor.unmount()
				}, 0)
			}
		}
		effect()

		return () => {
			cleanupRan = true
			if (activeEditor) {
				// setTimeout to prevent React error, see https://github.com/facebook/react/issues/25675.
				setTimeout(() => {
					activeEditor.unmount()
				}, 0)
			}
			container?.removeChild(effectContainer)
		}
	}, [rootElement, filePath, editorChoice, filesApi, setTabName, setTabIsUnsaved])

	return (
		<div ref={rootElement} />
	)
}
