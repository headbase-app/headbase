import type {BaseTabProps} from "@ui/03-features/workspace/workspace-tab.tsx";
import {FileEditor} from "@ui/03-features/file-editor/file-editor.tsx";

export interface ObjectEditorTabProps extends BaseTabProps {
	filePath: string
}

export function FileEditorTab(props: ObjectEditorTabProps) {
	return (
		<div>
			<FileEditor filePath={props.filePath} />
		</div>
	)
}
