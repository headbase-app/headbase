import {html} from "lit-html";
import {BehaviorSubject} from "rxjs";

import {BaseElement, addEventListener} from "@headbase-app/lib";

import "./database-manager.css"

export type DatabaseManagerPage = {type: "list"} | {type: "create"} | {type: "edit", id: string} | {type: "delete", id: string};

export interface DatabaseManagerEvents {
	"database-manager:navigate": DatabaseManagerPage,
}

export class DatabaseManager extends BaseElement {
	static tag = "hb-database-manager"
	page: BehaviorSubject<DatabaseManagerPage>

	constructor() {
		super();
		this.page = this.createState<DatabaseManagerPage>({type: "list"})
		addEventListener<DatabaseManagerEvents>(this, "database-manager:navigate", (e) => {
			e.stopImmediatePropagation()
			this.page.next(e.detail)
		})
	}

	render() {
		if (this.page.value.type === 'create') {
			return html`<hb-create-database></hb-create-database>`
		}
		else if (this.page.value.type === 'edit') {
			return html`<hb-edit-database databaseId=${this.page.value.id}></hb-edit-database>`
		}
		else if (this.page.value.type === 'delete') {
			return html`<hb-delete-database databaseId=${this.page.value.id}></hb-delete-database>`
		}
		return html`<hb-database-list></hb-database-list>`
	}
}
