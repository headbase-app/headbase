import {Observable} from "rxjs";

import type { IEventsService, IDeviceAPI, IWorkspaceVaultAPI, IVaultsAPI, LiveQueryResult } from "@headbase-app/libweb";
import { LiveQueryStatus, EventTypes, VaultDto } from "@headbase-app/libweb";

export class WebWorkspaceVaultAPI implements IWorkspaceVaultAPI {
	constructor(
		private readonly deviceService: IDeviceAPI,
		private readonly eventsService: IEventsService,
		private readonly vaultsService: IVaultsAPI,
	) {
		this.setup()
	}

	async setup() {
		const params = new URLSearchParams(window.location.search);
		const vaultId = params.get("vaultId");
		const currentVault = await this.get()

		if (vaultId) {
			await this.open(vaultId)
		}
		else if (currentVault) {
			document.title = `${currentVault.displayName} | Headbase`
		}
	}

	async open(vaultId: string) {
		const currentVault = await this.get()
		const vaultToOpen = await this.vaultsService.get(vaultId)

		if (currentVault) {
			this.eventsService.dispatch(EventTypes.VAULT_CLOSE, {
				context: this.deviceService.getCurrentContext(),
				data: {
					id: currentVault.id
				}
			})
		}
		if (vaultToOpen) {
			sessionStorage.setItem("hb_current_vault", JSON.stringify(vaultToOpen));
			document.title = `${vaultToOpen.displayName} | Headbase`
			this.eventsService.dispatch(EventTypes.VAULT_OPEN, {
				context: this.deviceService.getCurrentContext(),
				data: {
					id: vaultId
				}
			})
		}
	}

	async openNewContext(vaultId: string) {
		// todo: trigger open in new tab (?vaultId=<uuid>)
		console.debug(`Triggered open in new context for ${vaultId}`)
	}

	async get(): Promise<VaultDto | null> {
		const currentVaultString = sessionStorage.getItem("hb_current_vault");
		let currentVault: VaultDto | null
		if (currentVaultString) {
			try {
				currentVault = VaultDto.parse(JSON.parse(currentVaultString))
				return currentVault;
			}
			catch (error) {
				console.error("hb_current_vault found to be corrupted, ignoring.");
				sessionStorage.removeItem("hb_current_vault");
			}
		}
		return null;
	}

	async close() {
		const currentVault = await this.get()
		if (!currentVault) {
			throw new Error(`no vault is currently open`)
		}

		sessionStorage.removeItem("hb_current_vault");
		this.eventsService.dispatch(EventTypes.VAULT_CLOSE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: currentVault.id
			}
		})
	}

	liveGet() {
		return new Observable<LiveQueryResult<VaultDto | null>>((observer) => {
			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING})

				try {
					const currentVault = await this.get()
					observer.next({status: LiveQueryStatus.SUCCESS, result: currentVault })
				}
				catch (error) {
					observer.next({status: LiveQueryStatus.ERROR, errors: [error] })
				}
			}

			this.eventsService.subscribe(EventTypes.VAULT_OPEN, runQuery)
			this.eventsService.subscribe(EventTypes.VAULT_CLOSE, runQuery)
			this.eventsService.subscribe(EventTypes.VAULT_CHANGE, runQuery)
			runQuery()

			return {
				unsubscribe: () => {
					this.eventsService.unsubscribe(EventTypes.VAULT_OPEN, runQuery)
					this.eventsService.unsubscribe(EventTypes.VAULT_CLOSE, runQuery)
					this.eventsService.unsubscribe(EventTypes.VAULT_CHANGE, runQuery)
				}
			}
		})
	}
}
