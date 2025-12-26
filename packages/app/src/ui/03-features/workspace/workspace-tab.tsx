import type {WorkspaceTab} from "@/framework/workspace/workspace.context.ts";
import {Switch, Match} from "solid-js";
import {SearchTab} from "@ui/03-features/search/search-tab.tsx";
import {TypesTab} from "@ui/03-features/types/types-tab.tsx";
import {CreateObjectTab} from "@ui/03-features/create-object-tab/create-object-tab.tsx";
import {ObjectEditorTab} from "@ui/03-features/object-editor/object-editor-tab.tsx";
import {ObjectHistoryTab} from "@ui/03-features/object-history/object-history-tab.tsx";

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
					when={props.tab.type === "search" && props.tab} keyed>
					{(tab) => (
						<SearchTab tabId={tab.id} />
					)}
				</Match>
				<Match
					when={props.tab.type === "types" && props.tab} keyed>
					{(tab) => (
						<TypesTab tabId={tab.id} />
					)}
				</Match>
				<Match
					when={props.tab.type === "object-new" && props.tab} keyed>
					{(tab) => (
						<CreateObjectTab tabId={tab.id} typeObjectId={tab.typeObjectId} />
					)}
				</Match>
				<Match
					when={props.tab.type === "object" && props.tab} keyed>
					{(tab) => (
						<ObjectEditorTab tabId={tab.id} objectId={tab.objectId} />
					)}
				</Match>
				<Match
					when={props.tab.type === "object-history" && props.tab} keyed>
					{(tab) => (
						<ObjectHistoryTab tabId={tab.id} objectId={tab.objectId} />
					)}
				</Match>
			</Switch>
		</div>
	)
}
