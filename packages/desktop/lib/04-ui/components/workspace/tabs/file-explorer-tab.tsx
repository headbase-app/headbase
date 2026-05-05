import {FileExplorer} from "../../file-explorer/file-explorer";
import type {BaseTabProps} from "../workspace-tab";

export interface FileExplorerTabProps extends BaseTabProps {
	path?: string
}

export function FileExplorerTab(props: FileExplorerTabProps) {
	return (
		<div>
			<FileExplorer path={props.path} />
		</div>
	)
}
