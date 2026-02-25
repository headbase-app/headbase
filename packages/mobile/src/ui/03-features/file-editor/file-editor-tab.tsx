import type {BaseTabProps} from "@ui/03-features/workspace/workspace-tab.tsx";
import {FileEditor} from "@ui/03-features/file-editor/file-editor.tsx";

export interface ObjectEditorTabProps extends BaseTabProps {
	objectId: string
}

export function FileEditorTab(_props: ObjectEditorTabProps) {
	return (
		<div>
			<FileEditor />
		</div>
	)
}
