import {For, Show} from "solid-js";
import {useWorkspace} from "./workspace.context";
import {WorkspaceTab} from "./workspace-tab";


export function Workspace() {
	const { tabs, tabsState, setActiveTabId, activeTabId, closeTab } = useWorkspace()

	return (
		<>
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
			<hr />
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
