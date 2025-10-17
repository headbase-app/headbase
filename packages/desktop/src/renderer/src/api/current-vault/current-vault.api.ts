import {LocalVaultDto} from "@contracts/vaults";
import {IEventsAPI} from "@api/events/events.interface";
import {EventTypes} from "@api/events/events";
import {IDeviceAPI} from "@api/device/device.interface";
import {ICurrentVaultAPI} from "@api/current-vault/current-vault.interface";
import {LiveQueryStatus, LiveQuerySubscriber, LiveQuerySubscription} from "@contracts/query";

export class CurrentVaultAPI implements ICurrentVaultAPI {
	constructor(
		private readonly deviceService: IDeviceAPI,
		private readonly eventsService: IEventsAPI
	) {}

	async open(vaultId: string) {
		console.debug(`[vaults] requested open for ${vaultId}`)

		const result = await window.platformAPI.currentVault_open(vaultId)
		if (result.error) {
			throw result
		}

		this.eventsService.dispatch(EventTypes.DATABASE_OPEN, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: vaultId
			}
		})
	}

	async openNewWindow(vaultId: string) {
		const result = await window.platformAPI.currentVault_openNewWindow(vaultId)
		if (result.error) {
			throw result
		}

		this.eventsService.dispatch(EventTypes.DATABASE_OPEN, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: vaultId
			}
		})

		return result.result;
	}

	async get(): Promise<LocalVaultDto | null> {
		const result = await window.platformAPI.currentVault_get()
		if (result.error) {
			throw result
		}

		return result.result;
	}

	async close() {
		const currentVault = await this.get()
		if (!currentVault) {
			throw new Error(`no vault is currently open`)
		}

		const result = await window.platformAPI.currentVault_close()
		if (result.error) {
			throw result
		}

		this.eventsService.dispatch(EventTypes.DATABASE_CLOSE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: currentVault.id
			}
		})
	}

	liveGet(subscriber: LiveQuerySubscriber<LocalVaultDto | null>): LiveQuerySubscription {
		const runQuery = async () => {
			subscriber({status: LiveQueryStatus.LOADING})

			try {
				const currentVault = await this.get()
				subscriber({status: LiveQueryStatus.SUCCESS, result: currentVault })
			}
			catch (error) {
				subscriber({status: LiveQueryStatus.ERROR, errors: [error] })
			}
		}

		const handleEvent = async () => {
			runQuery()
		}

		this.eventsService.subscribe(EventTypes.DATABASE_OPEN, handleEvent)
		this.eventsService.subscribe(EventTypes.DATABASE_CLOSE, handleEvent)
		this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
		runQuery()

		return {
			unsubscribe: () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_OPEN, handleEvent)
				this.eventsService.unsubscribe(EventTypes.DATABASE_CLOSE, handleEvent)
				this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			}
		}
	}
}
