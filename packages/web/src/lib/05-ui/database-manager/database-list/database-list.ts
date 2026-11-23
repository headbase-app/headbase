import {html, nothing, type TemplateResult} from "lit-html";
import {when} from "lit-html/directives/when.js";
import {BehaviorSubject} from "rxjs";

import {DatabaseDto} from "../../../02-apis/database-manager/database.ts";
import {BaseElement} from "../../../03-framework/base-element";
import {useContext} from "../../../03-framework/context";
import {DatabaseManagerAPIContext, DatabaseSwitcherAPIContext} from "../../../03-framework/contexts";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "../../../01-common/control-flow";
import {type DatabaseManagerEvents} from "../database-manager.ts";
import {dispatchEvent} from "../../../03-framework/events.ts";


export class DatabaseList extends BaseElement {
	static tag = "hb-database-list"

	databaseManagerAPI = useContext(DatabaseManagerAPIContext)
	databaseSwitcherAPI = useContext(DatabaseSwitcherAPIContext)

	currentDatabase$: BehaviorSubject<LiveQueryResult<DatabaseDto | null>>
	databases$: BehaviorSubject<LiveQueryResult<DatabaseDto[]>>

	constructor() {
		super();
		this.currentDatabase$ = this.createState(LIVE_QUERY_LOADING_STATE, this.databaseSwitcherAPI.liveGet())
		this.databases$ = this.createState(LIVE_QUERY_LOADING_STATE, this.databaseManagerAPI.liveQuery())
	}

	render() {
		let content: TemplateResult
		if (this.databases$.value.status === "loading" || this.currentDatabase$.value.status === "loading") {
			content = html`<p>Loading databases...</p>`
		}
		else if (this.databases$.value.status === "error") {
			content = html`<p>Error loading databases: ${this.databases$.value.errors.toString()}</p>`
		}
		else if (this.currentDatabase$.value.status === "error") {
			content = html`<p>Error loading current database: ${this.currentDatabase$.value.errors.toString()}</p>`
		}
		else if (this.databases$.value.result.length === 0) {
			content = html`<p>No databases found.</p>`
		}
		else {
			const currentDatabases = this.currentDatabase$.value.result
			content = html`
				<ul>
					${this.databases$.value.result.map(database => html`
						<li>
							<h3>${database.displayName}${currentDatabases?.id === database.id ? html`<span>(OPEN)</span>`: nothing}</h3>
							${this.databaseManagerAPI.isLocationSelectable() ? html`<p>${database.path}</p>` : nothing}
							<button @click=${()=> {dispatchEvent<DatabaseManagerEvents>(this, "database-manager:navigate", {type: "delete", id: database.id})}}>Delete</button>
							<button @click=${()=> {dispatchEvent<DatabaseManagerEvents>(this, "database-manager:navigate", {type: "edit", id: database.id})}}>Edit</button>
							<button>New tab</button>
							${when(
								currentDatabases?.id === database.id,
								() => html`<button @click=${() => {this.databaseSwitcherAPI.close()}}>Close</button>`,
								() => html`<button @click=${() => {this.databaseSwitcherAPI.open(database.id)}}>Open</button>`
							)}
						</li>
					`)}
				</ul>
			`
		}

		return html`
			<div>
				<button @click=${() => {dispatchEvent<DatabaseManagerEvents>(this, "database-manager:navigate", {type: "create"})}}>Create</button>
				<div>
					${content}
				</div>
			</div>
		`
	}
}
