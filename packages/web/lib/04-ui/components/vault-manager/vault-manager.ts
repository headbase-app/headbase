import {html, render, TemplateResult} from "lit-html";
import {BaseElement} from "../../../03-framework/base-element";
import {BehaviorSubject} from "rxjs";

export type VaultManagerPage = {type: "list"} | {type: "create"} | {type: "edit", id: string} | {type: "delete", id: string};

export class VaultManager extends BaseElement {
	static tag = "hb-vault-manager"
	page: BehaviorSubject<VaultManagerPage>

	constructor() {
		super();
		this.page = this.observedState({type: "list"})
		this.addEventListener("hb-vault-manager-page", (e: CustomEventInit<VaultManagerPage>) => {
			this.page.next(e.detail)
		})
	}

	render() {
		let content: TemplateResult
		if (this.page.value.type === 'create') {
			content = html`<hb-create-vault></hb-create-vault>`
		}
		else if (this.page.value.type === 'edit') {
			content = html`<hb-edit-vault vault-id=${this.page.value.id}></hb-edit-vault>`
		}
		else if (this.page.value.type === 'delete') {
			content = html`<hb-delete-vault vault-id=${this.page.value.id}></hb-delete-vault>`
		}
		else {
			content = html`<hb-vaults-list></hb-vaults-list>`
		}
		render(content, this)
	}
}
