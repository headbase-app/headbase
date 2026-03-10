import {Switch, Match} from "solid-js";
import {FileExplorerTab} from "./tabs/file-explorer-tab";
import {SearchTab} from "./tabs/search-tab";
import {TypesTab} from "./tabs/types-tab";
import {FileEditorTab} from "./tabs/file-editor-tab";
import type {WorkspaceTabData} from "./workspace.context.ts";


export interface BaseTabProps {
	tabId: string
}

export interface WorkspaceTabProps {
	isActive: boolean
	tab: WorkspaceTabData
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
						<FileEditorTab tabId={tab.id} filePath={tab.path} />
					)}
				</Match>
			</Switch>
		</div>
	)
}
