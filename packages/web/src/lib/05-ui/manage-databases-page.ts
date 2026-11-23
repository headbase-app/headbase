import {html} from "lit-html";
import {BaseElement} from "../03-framework/base-element";

export class ManageDatabasesPage extends BaseElement {
	static tag = "hb-page-manage-databases"

	render() {
		return html`
			<h1>Select Database</h1>
			<hb-database-manager></hb-database-manager>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[ManageDatabasesPage.tag]: ManageDatabasesPage
	}
}
