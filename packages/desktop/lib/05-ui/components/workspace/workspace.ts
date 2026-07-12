import {html, nothing, TemplateResult} from "lit-html";
import {when} from "lit-html/directives/when.js";
import {BehaviorSubject} from "rxjs";

import {BaseElement, useContext, WorkspaceAPIContext} from "@headbase-app/lib";
import {WorkspaceTabs} from "../../../02-apis/workspace/workspace.api.ts";
import {styleMap} from "lit-html/directives/style-map.js";

export class Workspace extends BaseElement {
	static tag = "hb-workspace";

	workspaceAPI = useContext(WorkspaceAPIContext)
	tabs$: BehaviorSubject<WorkspaceTabs>;
	activeTab$: BehaviorSubject<string|null>;

	constructor() {
		super();
		this.tabs$ = this.createState([], this.workspaceAPI.liveQueryTabs())
		this.activeTab$ = this.createState(null, this.workspaceAPI.liveQueryActiveTab())
	}

	render(): TemplateResult | typeof nothing {
		// todo: use repeat directive?
		const tabs = this.tabs$.value.map(tab => {
			return html`
				<li data-is-active=${this.activeTab$.value === tab.id}>
					<button @click=${() => {this.workspaceAPI.switchToTab(tab.id)}}>${tab.name}</button>
					${when(tab.isChanged, () => html`<span>UNSAVED</span>`)}
					${when(tab.id === this.activeTab$.value, () => html`<span>ACTIVE</span>`)}
					<button @click=${() => {this.workspaceAPI.closeTab(tab.id)}}>close</button>
				</li>
			`
		})

		// todo: use repeat directive?
		// todo: path tab details
		const tabContents = this.tabs$.value.map(tab => {
			const isActive = this.activeTab$.value === tab.id

			// todo: I see this replaces with css styling via data attribute/classnames in future
			const style = {display: isActive ? "block" : "none"}

			if (tab.type === "file-explorer") {
				return html`
					<hb-file-explorer-tab
						.path=${tab.path}
						data-is-active=${isActive}
						style=${styleMap(style)}
					></hb-file-explorer-tab>`
			}
			else if (tab.type === "search") {
				return html`
					<hb-search-tab
						data-is-active=${isActive}
						style=${styleMap(style)}
					></hb-search-tab>`
			}
			else if (tab.type === "content-types") {
				return html`
					<hb-types-tab
						data-is-active=${isActive}
						style=${styleMap(style)}
					></hb-types-tab>`
			}
			else if (tab.type === "file") {
				return html`
					<hb-file-tab
						.path=${tab.path}
						data-is-active=${isActive}
						style=${styleMap(style)}
					></hb-file-tab>`
			}

			// todo: dynamic tab types which plugins can implement?
			// return html`
			// 	<div
			// 		data-is-active=${isActive}
			// 		style=${styleMap(style)}
			// 	>
			// 		<p>No supported display found for tab type "${tab.type}". This is not expected, please raise a GitHub issue.</p>
			// 		<p>${JSON.stringify(tab)}</p>
			// 	</div>
			// `
		})

		return html`
			<ul>
				${tabs}
			</ul>
			<hr />
			${when(this.tabs$.value.length === 0, () => html`<p>No open tabs</p>`)}
			<div>
				${tabContents}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[Workspace.tag]: Workspace
	}
}
