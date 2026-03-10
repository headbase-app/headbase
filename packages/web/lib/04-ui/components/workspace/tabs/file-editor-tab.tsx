import {FileEditor} from "../../file-editor/file-editor";
import type {BaseTabProps} from "../workspace-tab";

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
