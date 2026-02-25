import {Switch, Match} from "solid-js";

import type {WorkspaceTab} from "@ui/03-features/workspace/workspace.context.ts";
import {SearchTab} from "@ui/03-features/search/search-tab.tsx";
import {TypesTab} from "@ui/03-features/types/types-tab.tsx";
import {FileEditorTab} from "@ui/03-features/file-editor/file-editor-tab.tsx";
import {FileExplorerTab} from "@ui/03-features/file-explorer/file-explorer-tab.tsx";


export interface BaseTabProps {
	tabId: string
}

export interface WorkspaceTabProps {
	isActive: boolean
	tab: WorkspaceTab
}

export function WorkspaceTab(props: WorkspaceTabProps) {
	return (
		<div style={{display: props.isActive ? "block" : "none"}}>
			<Switch fallback={<p>{props.tab.type} - TAB TYPE TO IMPLEMENT</p>}>
				<Match
					when={props.tab.type === "file-explorer" && props.tab} keyed>
					{(tab) => (
						<FileExplorerTab tabId={tab.id} path={tab.path} />
					)}
				</Match>
				<Match
					when={props.tab.type === "search" && props.tab} keyed>
					{(tab) => (
						<SearchTab tabId={tab.id} />
					)}
				</Match>
				<Match
					when={props.tab.type === "content-types" && props.tab} keyed>
					{(tab) => (
						<TypesTab tabId={tab.id} />
					)}
				</Match>
				<Match
					when={props.tab.type === "file" && props.tab} keyed>
					{(tab) => (
						<FileEditorTab tabId={tab.id} objectId={tab.path} />
					)}
				</Match>
			</Switch>
		</div>
	)
}
