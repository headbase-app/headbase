import {html} from "lit-html";

import {BaseElement} from "../../../../03-framework/base-element";
import {useContext} from "../../../../03-framework/context";
import {VaultsAPIContext} from "../../../../03-framework/contexts";
import {dispatchEvent} from "../../../../03-framework/events";
import type {VaultManagerEvents} from "../vault-manager";
import type {BehaviorSubject} from "rxjs";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "../../../../01-common/control-flow";
import {VaultDto} from "../../../../02-apis/vaults/vault";

export class DeleteVault extends BaseElement {
	static tag = "hb-delete-vault"
	vaultsAPI = useContext(VaultsAPIContext)

	static observedAttributes = ["vaultId"]
	get vaultId() {return this.getAttribute("vaultId") as string}

	vault$!: BehaviorSubject<LiveQueryResult<VaultDto | null>>

	connectedCallback() {
		this.vault$ = this.observedState(LIVE_QUERY_LOADING_STATE, this.vaultsAPI.liveGet(this.vaultId))
	}

	async onDelete() {
		await this.vaultsAPI.delete(this.vaultId)
		dispatchEvent<VaultManagerEvents>(this, "vault-manager:navigate", {type: "list"})
	}

	render() {
		if (this.vault$.value.status === "loading") {
			return html`<p>Loading vault...</p>`
		}
		else if (this.vault$.value.status === "error") {
			return html`<p>An error occurred while loading the vault: ${this.vault$.value.errors.join(",")}</p>`
		}
		else if (this.vault$.value.result === null) {
			return html`<p>Vault Not Found</p>`
		}

		return html`
			<div>
				<button @click=${() => dispatchEvent<VaultManagerEvents>(this, "vault-manager:navigate", {type: "list"})}>All vaults</button>
				<h2>Are you sure you want to delete vault '${this.vault$.value.result.displayName}'?</h2>
				<p>The vault will be removed from the app, but your local files will not be deleted.</p>
				<button @click=${this.onDelete.bind(this)}>Delete vault</button>
			</div>
		`
	}
}
