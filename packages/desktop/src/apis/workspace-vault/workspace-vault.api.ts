import {Observable} from "rxjs";

import type { IEventsService, IDeviceAPI, IWorkspaceVaultAPI, IVaultsAPI, LiveQueryResult } from "@headbase-app/lib";
import { LiveQueryStatus, EventTypes, VaultDto } from "@headbase-app/lib";


export class WorkspaceVaultAPI implements IWorkspaceVaultAPI {
	constructor(
		private readonly eventsService: IEventsService,
		private readonly deviceService: IDeviceAPI,
		private readonly vaultsService: IVaultsAPI,
	) {
		this.setup()
	}

	async setup() {
		const currentVault = await this.get()
		if (currentVault) {
			document.title = `${currentVault.displayName} | Headbase`
		}
	}

	async open(vaultId: string) {
		const currentVault = await this.get()

		const context = await this.deviceService.getCurrentContext()
		if (currentVault) {
			await this.eventsService.dispatch(EventTypes.VAULT_CLOSE, {
				context,
				data: {
					id: currentVault.id
				}
			})
		}

		const platformResponse = await window.platformAPI.workspaceVault_open(vaultId)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}

		await this.eventsService.dispatch(EventTypes.VAULT_OPEN, {
			context,
			data: {
				id: vaultId
			}
		})
	}

	async openNewContext(vaultId: string) {
		const currentVault = await this.get()

		const context = await this.deviceService.getCurrentContext()
		if (currentVault) {
			await this.eventsService.dispatch(EventTypes.VAULT_CLOSE, {
				context,
				data: {
					id: currentVault.id
				}
			})
		}

		const platformResponse = await window.platformAPI.workspaceVault_openNewContext(vaultId)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}

		await this.eventsService.dispatch(EventTypes.VAULT_OPEN, {
			context,
			data: {
				id: vaultId
			}
		})
	}

	async get(): Promise<VaultDto | null> {
		const platformResponse = await window.platformAPI.workspaceVault_get()
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}

		return platformResponse.result
	}

	async close() {
		const currentVault = await this.get()
		if (!currentVault) {
			throw new Error(`no vault is currently open`)
		}

		const platformResponse = await window.platformAPI.workspaceVault_close()
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}

		const context = await this.deviceService.getCurrentContext()
		await this.eventsService.dispatch(EventTypes.VAULT_CLOSE, {
			context: context,
			data: {
				id: currentVault.id
			}
		})
	}

	liveGet() {
		return new Observable<LiveQueryResult<VaultDto | null>>((observer) => {
			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING, result: null})

				try {
					const currentVault = await this.get()
					observer.next({status: LiveQueryStatus.SUCCESS, result: currentVault })
				}
				catch (error) {
					observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null })
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
