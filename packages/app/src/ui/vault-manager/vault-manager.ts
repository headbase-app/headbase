import {html, type TemplateResult} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {consume} from "@lit/context";
import {createRef, type Ref, ref} from "lit-html/directives/ref.js";

import {i18nAPIContext} from "@/framework/context.ts";
import type {I18nAPI} from "@api/i18n/i18n.api.ts";
import {LightDomLitElement} from "@utils/light-dom-lit-element.ts";

import "@ui/vault-manager/vault-list.ts";
import "@ui/vault-manager/create-vault.ts";
import "@ui/vault-manager/edit-vault.ts";

export type VaultManagerPage = {type: "list"} | {type: "create"} | {type: "edit", id: string};

@customElement("vault-manager")
export class VaultManager extends LightDomLitElement {
	#dialog: Ref<HTMLDialogElement> = createRef<HTMLDialogElement>();

	@consume({context: i18nAPIContext})
	@property({ attribute: false })
	private i18nAPI!: I18nAPI;

	@state() currentPage: VaultManagerPage

	constructor() {
		super();
		this.currentPage = {type: "list"};
		this.onTriggerBound = this.onTrigger.bind(this);
	}
	private readonly onTriggerBound: VaultManager['onTrigger']

	connectedCallback(){
		super.connectedCallback();
		document.addEventListener("VaultManager_trigger", this.onTriggerBound)
	}

	disconnectedCallback(){
		super.disconnectedCallback();
		document.removeEventListener("VaultManager_trigger", this.onTriggerBound)
	}

	private onTrigger(e: CustomEvent<VaultManagerPage>) {
		this.#dialog?.value?.showModal()
		this.currentPage = e.detail ?? "other"
	}

	private onClose() {
		this.currentPage = {type: "list"};
		this.#dialog?.value?.close()
	}

	protected override render() {
		let page: TemplateResult;
		switch (this.currentPage.type) {
			case "create":
				page = html`<create-vault></create-vault>`
				break;
			case "edit":
				page = html`<edit-vault .vaultId=${this.currentPage.id}></edit-vault>`
				break;
			default:
				page = html`<vault-list></vault-list>`
				break;
		}

		return html`
			<dialog ${ref(this.#dialog)}>
				<button autofocus @click=${() => this.onClose()}>${this.i18nAPI.t("Close")}</button>
				<div>
					${page}
				</div>
			</dialog>
		`
	}
}

export type VaultManagerProps = Omit<Omit<VaultManager, keyof HTMLElement>, keyof LightDomLitElement>

declare global {
	interface HTMLElementTagNameMap {
		'vault-manager': VaultManager
	}
}
