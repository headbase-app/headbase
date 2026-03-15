import {html, render, type TemplateResult} from "lit-html";
import {BehaviorSubject} from "rxjs";

import {VaultDto} from "../../../../02-apis/vaults/vault";
import {BaseElement} from "../../../../03-framework/base-element";
import {useContext} from "../../../../03-framework/context";
import {FilesAPIContext, VaultsAPIContext, WorkspaceVaultAPIContext} from "../../../../03-framework/contexts";
import {LIVE_QUERY_LOADING_STATE, type LiveQueryResult} from "../../../../01-common/control-flow";
import {VaultManagerEvents, type VaultManagerPage} from "../vault-manager";
import {when} from "lit-html/directives/when.js";


export class VaultsList extends BaseElement {
	static tag = "hb-vaults-list"
	vaultsAPI = useContext(VaultsAPIContext)
	workspaceVaultAPI = useContext(WorkspaceVaultAPIContext)
	filesAPI = useContext(FilesAPIContext)

	currentVault: BehaviorSubject<LiveQueryResult<VaultDto | null>>
	vaults: BehaviorSubject<LiveQueryResult<VaultDto[]>>

	constructor() {
		super();
		this.currentVault = this.observedState(LIVE_QUERY_LOADING_STATE, this.workspaceVaultAPI.liveGet())
		this.vaults = this.observedState(LIVE_QUERY_LOADING_STATE, this.vaultsAPI.liveQuery())
	}

	navigate(page: VaultManagerPage) {
		this.dispatchEvent(new CustomEvent(VaultManagerEvents.NAVIGATE, {
			detail: page,
			bubbles: true,
		}))
	}

	render() {
		let content: TemplateResult
		if (this.vaults.value.status === "loading" || this.currentVault.value.status === "loading") {
			content = html`<p>Loading vaults...</p>`
		}
		else if (this.vaults.value.status === "error") {
			content = html`<p>Error loading vaults: ${this.vaults.value.errors.toString()}</p>`
		}
		else if (this.currentVault.value.status === "error") {
			content = html`<p>Error loading current vault: ${this.currentVault.value.errors.toString()}</p>`
		}
		else if (this.vaults.value.result.length === 0) {
			content = html`<p>No vaults found.</p>`
		}
		else {
			const currentVault = this.currentVault.value.result
			content = html`
				<ul>
					${this.vaults.value.result.map(vault => html`
						<li>
							<h3>${vault.displayName}</h3>
							${this.filesAPI.isVaultLocationSelectable() ?? html`<p>${vault.path}</p>`}
							<button @click=${()=> {this.navigate({type: "delete", id: vault.id})}}>Delete</button>
							<button @click=${()=> {this.navigate({type: "edit", id: vault.id})}}>Edit</button>
							<button>New tab</button>
							${when(
								currentVault?.id === vault.id,
								() => html`<button @click=${() => {this.workspaceVaultAPI.close()}}>Close</button>`,
								() => html`<button @click=${() => {this.workspaceVaultAPI.open(vault.id)}}>Open</button>`
							)}
						</li>
					`)}
				</ul>
			`
		}

		render(html`
			<div>
				<button @click=${() => {this.navigate({type: "create"})}}>Create</button>
				<div>
					${content}
				</div>
			</div>
		`, this)
	}
}
