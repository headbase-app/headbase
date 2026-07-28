import {html, nothing, TemplateResult} from "lit-html";
import {when} from "lit-html/directives/when.js";

import {
	BaseElement,
	EventsServiceContext,
	EventTypes,
	useContext, WorkspaceActiveChangeEvent,
	WorkspaceAPIContext,
	WorkspaceChangeEvent
} from "@headbase-app/lib";
import {WorkspaceItems} from "../../../02-apis/workspace/workspace.api.ts";
import {styleMap} from "lit-html/directives/style-map.js";

export class Workspace extends BaseElement {
	static tag = "hb-workspace";

	eventsService = useContext(EventsServiceContext)
	workspaceAPI = useContext(WorkspaceAPIContext)
	items: WorkspaceItems = [];
	activeItem: string|null = null;

	// todo: WorkspaceAPI should expose it's own methods for events/callbacks rather than using and exposing event service?
	connectedCallback() {
		this.items = this.workspaceAPI.getItems()
		this.activeItem = this.workspaceAPI.getActiveItem()

		this.eventsService.subscribe(EventTypes.WORKSPACE_CHANGE, this.onWorkspaceChangeBound);
		this.eventsService.subscribe(EventTypes.WORKSPACE_ACTIVE_CHANGE, this.onWorkspaceActiveChangeBound);

		super.connectedCallback()
	}
	disconnectedCallback() {
		this.eventsService.unsubscribe(EventTypes.WORKSPACE_CHANGE, this.onWorkspaceChangeBound);
		this.eventsService.unsubscribe(EventTypes.WORKSPACE_ACTIVE_CHANGE, this.onWorkspaceActiveChangeBound);

		super.disconnectedCallback();
	}

	onWorkspaceChange(event: WorkspaceChangeEvent) {
		this.items = event.detail.data.items
		this.requestUpdate()
	}
	onWorkspaceChangeBound = this.onWorkspaceChange.bind(this)
	onWorkspaceActiveChange(event: WorkspaceActiveChangeEvent) {
		this.activeItem = event.detail.data.activeItem
		this.requestUpdate()
	}
	onWorkspaceActiveChangeBound = this.onWorkspaceActiveChange.bind(this)

	render(): TemplateResult | typeof nothing {
		// todo: use repeat directive?
		const items = this.items.map(item => {
			return html`
				<li data-is-active=${this.activeItem === item.id}>
					<button @click=${() => {this.workspaceAPI.switch(item.id)}}>${item.name}</button>
					${when(item.isChanged, () => html`<span>UNSAVED</span>`)}
					${when(item.id === this.activeItem, () => html`<span>ACTIVE</span>`)}
					<button @click=${() => {this.workspaceAPI.close(item.id)}}>close</button>
				</li>
			`
		})

		// todo: use repeat directive?
		// todo: path tab details
		const tabContents = this.items.map(item => {
			const isActive = this.activeItem === item.id

			// todo: I see this replaces with css styling via data attribute/classnames in future
			const style = {display: isActive ? "block" : "none"}
			return html`
					<hb-workspace-plugin-item
						id=${item.id}
						.item=${item}
						data-is-active=${isActive}
						style=${styleMap(style)}
					>
					</hb-workspace-plugin-item>
				`;
		})

		return html`
			<ul>
				${items}
			</ul>
			<hr />
			${when(this.items.length === 0, () => html`<p>No open items</p>`)}
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
