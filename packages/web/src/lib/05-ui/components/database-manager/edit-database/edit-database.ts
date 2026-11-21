import {html} from "lit-html";

import {BaseElement} from "../../../../03-framework/base-element";
import {useContext} from "../../../../03-framework/context";
import {DatabaseManagerAPIContext} from "../../../../03-framework/contexts";
import {dispatchEvent} from "../../../../03-framework/events";
import type {DatabaseManagerEvents} from "../database-manager.ts";
import type {DatabaseFormFields} from "../database-form.ts";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult, type DatabaseDto} from "@headbase-app/lib";
import type {BehaviorSubject} from "rxjs";

export class EditDatabase extends BaseElement {
	static tag = "hb-edit-database"
	databaseManagerAPI = useContext(DatabaseManagerAPIContext)

	static observedAttributes = ["databaseId"]
	get databaseId() {return this.getAttribute("databaseId") as string}

	database$!: BehaviorSubject<LiveQueryResult<DatabaseDto | null>>

	connectedCallback() {
		this.database$ = this.createState(LIVE_QUERY_LOADING_STATE, this.databaseManagerAPI.liveGet(this.databaseId))
	}

	async onSubmit(values: DatabaseFormFields) {
		await this.databaseManagerAPI.update(this.databaseId, values)
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
			return html`
				<div>
					<button @click=${() => dispatchEvent<DatabaseManagerEvents>(this, "database-manager:navigate", {type: "list"})}>All Databases</button>
					<p>Database Not Found</p>
				</div>
			`
		}

		return html`
			<hb-database-form
				.title="Edit database '${this.database$.value.result.displayName}'"
				.submitText=${"Update Database"}
				.initialValues=${{
					id: this.database$.value.result.id,
					displayName: this.database$.value.result.displayName,
					path: this.database$.value.result.path
				}}
				.onSubmit=${this.onSubmit.bind(this)}
			></hb-database-form>
		`
	}
}
