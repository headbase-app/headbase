import {html} from "lit-html";

import {BaseElement} from "../../../../03-framework/base-element";
import {useContext} from "../../../../03-framework/context";
import {DatabaseManagerAPIContext} from "../../../../03-framework/contexts";
import {dispatchEvent} from "../../../../03-framework/events";
import type {DatabaseManagerEvents} from "../database-manager.ts";
import type {BehaviorSubject} from "rxjs";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "../../../../01-common/control-flow";
import {DatabaseDto} from "../../../../02-apis/database-manager/database.ts";

export class DeleteDatabase extends BaseElement {
	static tag = "hb-delete-database"
	databaseManagerAPI = useContext(DatabaseManagerAPIContext)

	static observedAttributes = ["databaseId"]
	get databaseId() {return this.getAttribute("databaseId") as string}

	database$!: BehaviorSubject<LiveQueryResult<DatabaseDto | null>>

	connectedCallback() {
		this.database$ = this.createState(LIVE_QUERY_LOADING_STATE, this.databaseManagerAPI.liveGet(this.databaseId))
	}

	async onDelete() {
		await this.databaseManagerAPI.delete(this.databaseId)
		dispatchEvent<DatabaseManagerEvents>(this, "database-manager:navigate", {type: "list"})
	}

	render() {
		if (this.database$.value.status === "loading") {
			return html`<p>Loading database...</p>`
		}
		else if (this.database$.value.status === "error") {
			return html`<p>An error occurred while loading the database: ${this.database$.value.errors.join(",")}</p>`
		}
		else if (this.database$.value.result === null) {
			return html`<p>Database Not Found</p>`
		}

		return html`
			<div>
				<button @click=${() => dispatchEvent<DatabaseManagerEvents>(this, "database-manager:navigate", {type: "list"})}>All Databases</button>
				<h2>Are you sure you want to delete database '${this.database$.value.result.displayName}'?</h2>
				<p>The database will be removed from the app, but your local files will not be deleted.</p>
				<button @click=${this.onDelete.bind(this)}>Delete database</button>
			</div>
		`
	}
}
