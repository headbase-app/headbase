import {html} from "lit-html";
import {BehaviorSubject} from "rxjs";

import {BaseElement, addEventListener} from "@headbase-app/lib";

import "./vault-manager.css"

export type VaultManagerPage = {type: "list"} | {type: "create"} | {type: "edit", id: string} | {type: "delete", id: string};

export interface VaultManagerEvents {
	"vault-manager:navigate": VaultManagerPage,
}

export class VaultManager extends BaseElement {
	static tag = "hb-vault-manager"
	page: BehaviorSubject<VaultManagerPage>

	constructor() {
		super();
		this.page = this.createState<VaultManagerPage>({type: "list"})
		addEventListener<VaultManagerEvents>(this, "vault-manager:navigate", (e) => {
			e.stopImmediatePropagation()
			this.page.next(e.detail)
		})
	}

	render() {
		if (this.page.value.type === 'create') {
			return html`<hb-create-vault></hb-create-vault>`
		}
		else if (this.page.value.type === 'edit') {
			return html`<hb-edit-vault vaultId=${this.page.value.id}></hb-edit-vault>`
		}
		else if (this.page.value.type === 'delete') {
			return html`<hb-delete-vault vaultId=${this.page.value.id}></hb-delete-vault>`
		}
		return html`<hb-vaults-list></hb-vaults-list>`
	}
}
