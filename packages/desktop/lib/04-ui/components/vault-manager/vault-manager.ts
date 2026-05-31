import {h} from "../../../03-framework/hyper/hyper.ts";
import {IVaultsAPI} from "../../../02-apis/vaults/vaults.api.ts";
import {IWorkspaceVaultAPI} from "../../../02-apis/workspace-vault/workspace-vault.api.ts";
import {VaultDto} from "../../../02-apis/vaults/vault.ts";

export class VaultManager {
	root!: HTMLElement;
	onOpenCallback?: (vaultId: string) => void;
	onCloseCallback?: (vaultId: string) => void;

	constructor(
		private vaultAPI: IVaultsAPI,
		private workspaceVaultAPI: IWorkspaceVaultAPI,
	) {}

	async load(root: HTMLElement) {
		this.root = root;
		this.#render()
		return this;
	}

	onOpen(callback: (vaultId: string) => void) {
		this.onOpenCallback = callback;
		return this;
	}
	onClose(callback: (vaultId: string) => void) {
		this.onCloseCallback = callback;
		return this;
	}

	async #render() {
		this.#renderLoader()

		const vaults = await this.vaultAPI.query()
		await this.#renderList(vaults)
	}

	#renderLoader() {
		h('div.loader',
			h("h1.title", "Loading..."),
		).mountReplace(this.root);
	}

	async #renderList(vaults: VaultDto[]) {
		const currentVault = await this.workspaceVaultAPI.get();

		const vaultCards = vaults.map((vault: VaultDto) => (
			h("div.vault-card",
				h("h3.title", vault.displayName),
				h("p.path", vault.path),
				currentVault?.id === vault.id && h("p.active-indicator", "Currently Open"),
				h("div.actions",
					h("button", "Delete", {onclick: () => {this.#renderDelete(vault)}}),
					h("button", "Edit", {onclick: () => {this.#renderEdit(vault)}}),
					currentVault?.id === vault.id
						? h("button", "Close", {onclick: () => {this.onCloseCallback?.(vault.id)}})
						: h("button", "Open", {onclick: () => {this.onOpenCallback?.(vault.id)}}),
				)
			)
		))

		h('div.vault-manager',
			h('ul.vault-list', vaultCards),
			h('div.create-section',
				h("button.create-vault", "Create New Vault", {onclick: () => {this.#renderCreate()}})
			),
		).mountReplace(this.root);
	}

	async #renderCreate() {
		h('div',
			h('button', "List All", {onclick: () => {this.#render()}}),
			h('h1', "Create Vault"),
		).mountReplace(this.root);
	}

	async #renderEdit(vault: VaultDto) {
		h('div',
			h('button', "List All", {onclick: () => {this.#render()}}),
			h('h1', "Edit Vault", h("b", vault.displayName)),
		).mountReplace(this.root);
	}

	async #renderDelete(vault: VaultDto) {
		h('div',
			h('button', "List All", {onclick: () => {this.#render()}}),
			h('h1', "Delete Vault", h("b", vault.displayName)),
		).mountReplace(this.root);
	}
}
