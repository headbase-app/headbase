import type {WorkspaceTab} from "@/framework/workspace/workspace.context.ts";
import {Switch, Match} from "solid-js";
import {FileEditorTab} from "@ui/03-features/file-editor/file-editor-tab.tsx";

export interface WorkspaceTabProps {
	isActive: boolean
	tab: WorkspaceTab
}

export function WorkspaceTab(props: WorkspaceTabProps) {
	console.debug("WorkspaceTab render")

	return (
		<div style={{display: props.isActive ? "block" : "none"}}>
			<Switch fallback={<p>{props.tab.name} - TAB TYPE TO IMPLEMENT</p>}>
				<Match when={props.tab.type === "file" && props.tab} keyed>
					{(tab) => (
						<FileEditorTab tabId={tab.id} filePath={tab.filePath} />
					)}
				</Match>
			</Switch>
		</div>
	)
}
