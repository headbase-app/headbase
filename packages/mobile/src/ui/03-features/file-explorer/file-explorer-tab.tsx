import type {BaseTabProps} from "@ui/03-features/workspace/workspace-tab.tsx";
import {FileExplorer} from "@ui/03-features/file-explorer/file-explorer.tsx";

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
