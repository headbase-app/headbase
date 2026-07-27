import {html, nothing, TemplateResult} from "lit-html";
import {when} from "lit-html/directives/when.js";
import {BehaviorSubject} from "rxjs";

import {
	BaseElement, LIVE_QUERY_LOADING_STATE,
	type LiveQueryResult,
	useContext, VaultDto, VaultManagerEvents,
	VaultsAPIContext,
	WorkspaceVaultAPIContext,
	dispatchEvent, WorkspaceAPIContext, ApplicationAPIContext, DeviceAPIContext, FilesAPIContext
} from "@headbase-app/lib";

import "./vault-menu.css"
import {ShelfItemPluginClass} from "../../../02-apis/plugin/plugins/shelf-item-plugin.ts";

function i(name: string) {
	return html`<i class="icon icon-${name}"></i>`
}

// todo: rename to application shelf
export class VaultMenu extends BaseElement {
	static tag = "hb-vault-menu"

	deviceAPI = useContext(DeviceAPIContext)
	vaultsAPI = useContext(VaultsAPIContext)
	filesAPI = useContext(FilesAPIContext)
	workspaceVaultAPI = useContext(WorkspaceVaultAPIContext)
	workspaceAPI = useContext(WorkspaceAPIContext)
	applicationAPI = useContext(ApplicationAPIContext)

	currentVault$: BehaviorSubject<LiveQueryResult<VaultDto | null>>
	vaults$: BehaviorSubject<LiveQueryResult<VaultDto[]>>

	shelfItems: ShelfItemPluginClass[] = []

	constructor() {
		super();
		this.currentVault$ = this.createState(LIVE_QUERY_LOADING_STATE, this.workspaceVaultAPI.liveGet())
		this.vaults$ = this.createState(LIVE_QUERY_LOADING_STATE, this.vaultsAPI.liveQuery())
	}

	async connectedCallback() {
		this.shelfItems = await this.applicationAPI.getShelfItems();
	}

	async triggerShelfItem(shelfItem: ShelfItemPluginClass) {
		// todo: plugin instantiation should be managed via ApplicationAPI
		const instance = new shelfItem({deviceAPI: this.deviceAPI, workspaceAPI: this.workspaceAPI, filesAPI: this.filesAPI, applicationAPI: this.applicationAPI});
		await instance.trigger()
	}

	render() {
		const vaults = this.vaults$.value.result
		const currentVault = this.currentVault$.value.result

		const shelfItems = this.shelfItems.map(shelfItem => (html`
			<button aria-label=${shelfItem.meta.name} @click=${() => {this.triggerShelfItem(shelfItem)}}>
				${i(shelfItem.meta.icon)}
			</button>
		`))

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
				<div>
					${shelfItems}
				</div>
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
