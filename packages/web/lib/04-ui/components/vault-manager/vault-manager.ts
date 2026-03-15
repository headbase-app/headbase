import {html, render, type TemplateResult} from "lit-html";
import {BehaviorSubject} from "rxjs";
import {BaseElement} from "../../../03-framework/base-element";

import "./vault-manager.css"

export type VaultManagerPage = {type: "list"} | {type: "create"} | {type: "edit", id: string} | {type: "delete", id: string};

export const VaultManagerEvents = {
	NAVIGATE: "hb:vault-manager:navigate",
} as const


export class VaultManager extends BaseElement {
	static tag = "hb-vault-manager"
	page: BehaviorSubject<VaultManagerPage>

	constructor() {
		super();
		this.page = this.observedState<VaultManagerPage>({type: "list"})
		// @ts-ignore -- todo: add easy way to satisfy types on custom events?
		this.addEventListener(VaultManagerEvents.NAVIGATE, (e: CustomEvent<VaultManagerPage>) => {
			e.stopImmediatePropagation()
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
