import {html, nothing, TemplateResult} from "lit-html";
import {when} from "lit-html/directives/when.js";
import {BehaviorSubject} from "rxjs";

import {
	BaseElement, LIVE_QUERY_LOADING_STATE,
	type LiveQueryResult,
	useContext, VaultDto, VaultManagerEvents,
	VaultsAPIContext,
	WorkspaceVaultAPIContext,
	dispatchEvent
} from "@headbase-app/lib";

import "./vault-menu.css"

function i(name: string) {
	return html`<i class="icon icon-${name}"></i>`
}

export class VaultMenu extends BaseElement {
	static tag = "hb-vault-menu"

	vaultsAPI = useContext(VaultsAPIContext)
	workspaceVaultAPI = useContext(WorkspaceVaultAPIContext)
	workspaceAPI = useContext(WorkspaceVaultAPIContext)

	currentVault$: BehaviorSubject<LiveQueryResult<VaultDto | null>>
	vaults$: BehaviorSubject<LiveQueryResult<VaultDto[]>>

	constructor() {
		super();
		this.currentVault$ = this.createState(LIVE_QUERY_LOADING_STATE, this.workspaceVaultAPI.liveGet())
		this.vaults$ = this.createState(LIVE_QUERY_LOADING_STATE, this.vaultsAPI.liveQuery())
	}

	render() {
		const vaults = this.vaults$.value.result
		const currentVault = this.currentVault$.value.result

		// todo: handle errors
		let switcherContent: TemplateResult
		if (!vaults || !currentVault) {
			switcherContent = html`<p>Loading vaults...</p>`
		}
		else {
			const currentVault = this.currentVault$.value.result
			switcherContent = html`
				<ul>
					${this.vaults$.value.result.map(vault => html`
						<li>
							<h3>${vault.displayName}${currentVault?.id === vault.id ? html`<span>(OPEN)</span>`: nothing}</h3>
							${this.vaultsAPI.isLocationSelectable() ? html`<p>${vault.path}</p>` : nothing}
							<button @click=${()=> {dispatchEvent<VaultManagerEvents>(this, "vault-manager:navigate", {type: "delete", id: vault.id})}}>Delete</button>
							<button @click=${()=> {dispatchEvent<VaultManagerEvents>(this, "vault-manager:navigate", {type: "edit", id: vault.id})}}>Edit</button>
							<button>New tab</button>
							${when(currentVault?.id === vault.id,
								() => html`<button @click=${() => {this.workspaceVaultAPI.close()}}>Close</button>`,
								() => html`<button @click=${() => {this.workspaceVaultAPI.open(vault.id)}}>Open</button>`
							)}
						</li>
					`)}
				</ul>
			`
		}

		const switcherText = currentVault ? currentVault.displayName : "Open Vault"
		return html`
			<div class="vault-menu">
				<button popovertarget="vault-switcher">${switcherText}${i("chevron-up")}</button>
				<button>${i("shapes")}</button>
				<button @click=${()=> {
					//this.workspaceAPI.openTab({type: "file-explorer"})
				}}>
					${i("folder")}
				</button>
				<button @click=${()=> {
					//this.workspaceAPI.openTab({type: "search"})
				}}>
					${i("search")}
				</button>
				</button>
				<button @click=${()=> {
					//this.workspaceAPI.openTab({type: "new"})
				}}>
					${i("plus")}
				</button>
			</div>
			<div class="vault-switcher" popover id="vault-switcher">
				${switcherContent}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[VaultMenu.tag]: VaultMenu
	}
}
