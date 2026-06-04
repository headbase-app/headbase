
import {IDeviceAPI} from "./02-apis/device/device.api.ts";
import {IEventsService} from "./02-apis/events/events.service.ts";
import {IVaultsAPI} from "./02-apis/vaults/vaults.api.ts";
import {IWorkspaceVaultAPI} from "./02-apis/workspace-vault/workspace-vault.api.ts";
import {IFilesAPI} from "./02-apis/files/files.api.ts";
import {IPluginStore} from "./02-apis/plugin/plugin.api.ts";
import {HeadbaseCorePlugin} from "./headbase-plugin.ts";

import {h} from "./03-framework/hyper/hyper.ts";
import {VaultManager} from "./04-ui/components/vault-manager/vault-manager.ts";

export interface InjectedDependencies {
	deviceAPI: IDeviceAPI,
	eventsService: IEventsService,
	vaultsAPI: IVaultsAPI,
	workspaceVaultAPI: IWorkspaceVaultAPI,
	filesAPI: IFilesAPI,
	pluginStore: IPluginStore,
}

export interface HeadbaseAppProps {
	root: HTMLElement,
	deps: InjectedDependencies
}
export class HeadbaseApp {
	root!: HTMLElement;

	constructor(
		private deviceAPI: IDeviceAPI,
		private eventsService: IEventsService,
		private vaultsAPI: IVaultsAPI,
		private workspaceVaultAPI: IWorkspaceVaultAPI,
		private filesAPI: IFilesAPI,
		private pluginStore: IPluginStore,
	) {}

	async load(root: HTMLElement) {
		this.root = root;
		this.pluginStore.registerBasePlugin(HeadbaseCorePlugin)
		await this.#render()
		console.debug("app load")
		return this;
	}

	async #render() {
		// Set splash
		this.#renderSplash()

		// Check for welcome message todo: replace with app level API
		const isWelcomed = localStorage.getItem("isWelcomed");
		if (isWelcomed !== "true") {
			return this.#renderWelcome()
		}

		const openVault = await this.workspaceVaultAPI.get()
		if (openVault) {
			this.#renderApp()
		}
		else {
			this.#renderVaultManager()
		}
	}

	#renderSplash() {
		h('form.splash',
			h('div.splash-message',
				h("h1.title", "Loading..."),
			)
		).mountReplace(this.root)
	}

	#renderWelcome() {
		h('form.welcome',
			h('div.welcome-message',
				h("h1.title", "Welcome to Headbase!"),
				h("p.message", "This is the welcome screen"),
				h("button.btn", "Continue")
			),
			{
				onSubmit: (e: SubmitEvent) => {
					e.preventDefault();
					localStorage.setItem("isWelcomed", "true");
					this.#render()
				}
			}
		).mountReplace(this.root)
	}

	#renderVaultManager() {
		const vaultManager = new VaultManager(
			this.vaultsAPI,
			this.workspaceVaultAPI,
		)
			.onOpen(async (vaultId) => {
				// todo: error handling?
				await this.workspaceVaultAPI.open(vaultId)
				this.#render()
			})
			.load(this.root)
	}

	#renderApp() {
		h('h1', 'App').mountReplace(this.root)
	}
}
