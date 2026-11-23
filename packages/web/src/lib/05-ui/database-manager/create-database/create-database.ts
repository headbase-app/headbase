import {html} from "lit-html";

import {BaseElement} from "../../../03-framework/base-element";
import {useContext} from "../../../03-framework/context";
import {DatabaseManagerAPIContext} from "../../../03-framework/contexts";
import {dispatchEvent} from "../../../03-framework/events.ts";
import type {DatabaseManagerEvents} from "../database-manager.ts";
import type {DatabaseFormFields} from "../database-form.ts";

export class CreateDatabase extends BaseElement {
	static tag = "hb-create-database"
	databaseManagerAPI = useContext(DatabaseManagerAPIContext)

	async onSubmit(values: DatabaseFormFields) {
		// todo: logic which should be managed at platform level via APIs? .getDatabaseLocation() which either returns null or path, rather than isLocationSelectable()
		const path = this.databaseManagerAPI.isLocationSelectable()
			? values.path
			: `/headbase/databases/${values.id}.sqlite`

		await this.databaseManagerAPI.create({id: values.id, displayName: values.displayName, path})
		dispatchEvent<DatabaseManagerEvents>(this, "database-manager:navigate", {type: "list"})
	}

	render() {
		return html`
			<hb-database-form
				title="Create New Database"
				.submitText=${"Create Database"}
				.onSubmit=${this.onSubmit.bind(this)}
			></hb-database-form>
		`
	}
}
