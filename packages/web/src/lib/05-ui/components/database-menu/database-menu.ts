import {html, nothing} from "lit-html";
import type {TemplateResult} from "lit-html";
import {when} from "lit-html/directives/when.js";
import {BehaviorSubject} from "rxjs";

import {
	BaseElement, LIVE_QUERY_LOADING_STATE,
	type LiveQueryResult,
	useContext, DatabaseDto,
	DatabaseManagerAPIContext,
	DatabaseSwitcherAPIContext,
	dispatchEvent, WorkspaceAPIContext, ApplicationAPIContext, DeviceAPIContext, MatterDatabaseAPIContext
} from "@headbase-app/lib";
import type {DatabaseManagerEvents} from "@headbase-app/lib";

import "./database-menu.css"
import type {AppShelfPluginClass} from "../../../02-apis/plugin/app-shelf-plugin/app-shelf-plugin.ts";

function i(name: string) {
	return html`<i class="icon icon-${name}"></i>`
}

// todo: rename to application shelf?
export class DatabaseMenu extends BaseElement {
	static tag = "hb-database-menu"

	deviceAPI = useContext(DeviceAPIContext)
	databaseManagerAPI = useContext(DatabaseManagerAPIContext)
	databaseSwitcherAPI = useContext(DatabaseSwitcherAPIContext)
	workspaceAPI = useContext(WorkspaceAPIContext)
	applicationAPI = useContext(ApplicationAPIContext)
	databaseAPI = useContext(MatterDatabaseAPIContext)

	currentDatabase$: BehaviorSubject<LiveQueryResult<DatabaseDto | null>>
	databases$: BehaviorSubject<LiveQueryResult<DatabaseDto[]>>

	shelfItems: AppShelfPluginClass[] = []

	constructor() {
		super();
		this.currentDatabase$ = this.createState(LIVE_QUERY_LOADING_STATE, this.databaseSwitcherAPI.liveGet())
		this.databases$ = this.createState(LIVE_QUERY_LOADING_STATE, this.databaseManagerAPI.liveQuery())
	}

	async connectedCallback() {
		this.shelfItems = await this.applicationAPI.getShelfItems();
	}

	async triggerShelfItem(shelfItem: AppShelfPluginClass) {
		// todo: plugin instantiation should be managed via ApplicationAPI
		const instance = new shelfItem({deviceAPI: this.deviceAPI, workspaceAPI: this.workspaceAPI, databaseAPI: this.databaseAPI ,applicationAPI: this.applicationAPI});
		await instance.trigger()
	}

	render() {
		const databases = this.databases$.value.result
		const currentDatabase = this.currentDatabase$.value.result

		const shelfItems = this.shelfItems.map(shelfItem => (html`
			<button aria-label=${shelfItem.meta.name} @click=${() => {this.triggerShelfItem(shelfItem)}}>
				${i(shelfItem.meta.icon)}
			</button>
		`))

		// todo: handle errors
		let switcherContent: TemplateResult
		if (!databases || !currentDatabase) {
			switcherContent = html`<p>Loading databases...</p>`
		}
		else {
			const currentDatabase = this.currentDatabase$.value.result
			switcherContent = html`
				<ul>
					${this.databases$.value.result.map(database => html`
						<li>
							<h3>${database.displayName}${currentDatabase?.path === database.path ? html`<span>(OPEN)</span>`: nothing}</h3>
							${this.databaseManagerAPI.isLocationSelectable() ? html`<p>${database.path}</p>` : nothing}
							<button @click=${()=> {dispatchEvent<DatabaseManagerEvents>(this, "database-manager:navigate", {type: "delete", id: database.path})}}>Delete</button>
							<button @click=${()=> {dispatchEvent<DatabaseManagerEvents>(this, "database-manager:navigate", {type: "edit", id: database.path})}}>Edit</button>
							<button>New tab</button>
							${when(currentDatabase?.path === database.path,
								() => html`<button @click=${() => {this.databaseSwitcherAPI.close()}}>Close</button>`,
								() => html`<button @click=${() => {this.databaseSwitcherAPI.open(database.path)}}>Open</button>`
							)}
						</li>
					`)}
				</ul>
			`
		}

		const switcherText = currentDatabase ? currentDatabase.displayName : "Open Database"
		return html`
			<div class="database-menu">
				<button popovertarget="database-switcher">${switcherText}${i("chevron-up")}</button>
				<div>
					${shelfItems}
				</div>
			</div>
			<div class="database-switcher" popover id="database-switcher">
				${switcherContent}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[DatabaseMenu.tag]: DatabaseMenu
	}
}
