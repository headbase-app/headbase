import {useWorkspace} from "@/framework/workspace/workspace.context.ts";
import {For, Show} from "solid-js";
import {WorkspaceTab} from "@ui/03-features/workspace/workspace-tab.tsx";

export function Workspace() {
	const { tabs, tabsState, setActiveTabId, activeTabId, closeTab } = useWorkspace()

	return (
		<>
			<p>Workspace:</p>
			<For each={tabs}>
				{(tab, index) => (
					<div>
						<button onClick={() => {setActiveTabId(tab.id)}}>
							{tabsState[index()]?.name}
							<Show when={tabsState[index()]?.isChanged}>
								<span>[UNSAVED]</span>
							</Show>
							<Show when={tab.id === activeTabId()}>
								<span>[ACTIVE]</span>
							</Show>
						</button>
						<button onClick={() => {closeTab(tab.id)}}>Close</button>
					</div>
				)}
			</For>
			<div>
				<Show when={tabs.length === 0}>
					<p>No open tabs</p>
				</Show>
				<For each={tabs}>
					{(tab) => (
						<WorkspaceTab tab={tab} isActive={tab.id === activeTabId()} />
					)}
				</For>
			</div>
		</>
	)
}
