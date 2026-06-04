import {h, ref} from "../../../03-framework/hyper/hyper.ts";
import {IVaultsAPI} from "../../../02-apis/vaults/vaults.api.ts";
import {IWorkspaceVaultAPI} from "../../../02-apis/workspace-vault/workspace-vault.api.ts";
import {CreateVaultDto, VaultDto} from "../../../02-apis/vaults/vault.ts";
import {HyperForm} from "../../../03-framework/hyper/form/form.ts";
import {z} from "zod";
import {BehaviorSubject, interval, map} from "rxjs";

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

		console.debug("pulse start")
		const pulse = interval(1000)
			.pipe(map(value => {
				console.debug("interval", value)
				return h("p",`Value: ${value}`)
			}))

		h('div.vault-manager',
			pulse,
			h('ul.vault-list', vaultCards),
			h('div.create-section',
				h("button.create-vault", "Create New Vault", {onclick: () => {this.#renderCreate()}})
			),
		).mountReplace(this.root);
	}

	async #renderCreate() {
		const hyperForm = new HyperForm({
			initialValues: {displayName: "", path: ""},
			validator: (values) => {
				const result = CreateVaultDto.safeParse(values)
				if (!result.success) {
					const zodErrors = z.flattenError(result.error)
					return {
						fields: {
							displayName: zodErrors?.fieldErrors.displayName?.[0],
							path: zodErrors?.fieldErrors.path?.[0],
						}
					}
				}
			},
			onSubmit: (values) => {
				console.debug("Submit", values);
			}
		})

		const createForm = h<HTMLFormElement>("form.form", { [ref]: (f) => {hyperForm.bindForm(f)} },
			h("div",
				h("h3", "Create Vault")
			),
			h("div",
				h("div",
					h("label", "Display Name"),
					h<HTMLInputElement>("input", {
						[ref]: (i) => hyperForm.bindInput("displayName", i)
					}),
					h("p.error-text", {[ref]: (p) => {hyperForm.bindFieldError("displayName", p)}}),
				),
				h("div",
					h("button", "Select Vault", {
						type: "button",
						onclick: async () => {
							const result = await this.vaultAPI.selectLocation()
							hyperForm.change("path", result ?? '')
						}
					}),
					h("p.error-text", {[ref]: (p) => {hyperForm.bindFieldError("path", p)}}),
				)
			),
			h("div",
				h("p", {[ref]: (p) => {hyperForm.bindRootError(p)}})
			),
			h("div",
				h("button", "Reset", {type: "button", onclick: () => {hyperForm.reset()}}),
				h("button", "Create Form")
			),
		)

		h('div',
			h('button', "List All", {onclick: () => {this.#render()}}),
			createForm
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
