import {IVaultsService} from "@renderer/services/vaults/vaults.interface";
import {CreateVaultDto, UpdateVaultDto, Vault} from "../../../../contracts/vaults";
import {IEventsService} from "@renderer/services/events/events.interface";
import {EventTypes} from "@renderer/services/events/events";
import {IDeviceService} from "@renderer/services/device/device.interface";
import {Subscriber, Subscription, SubscriptionResultStatus} from "../../utils/subscriptions";

export class WebVaultsService implements IVaultsService {
	constructor(
		private readonly deviceService: IDeviceService,
		private readonly eventsService: IEventsService
	) {
	}

	async createVault(createVaultDto: CreateVaultDto) {
		const result = await window.platformAPI.createVault(createVaultDto)
		if (result.error) {
			throw result
		}

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: result.result.id,
				action: "create"
			}
		})
		return result.result;
	}

	async updateVault(vaultId: string, updateVaultDto: UpdateVaultDto) {
		const result = await window.platformAPI.updateVault(vaultId, updateVaultDto)
		if (result.error) {
			throw result
		}

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: result.result.id,
				action: "update"
			}
		})
		return result.result;
	}

	async deleteVault(vaultId: string) {
		const result = await window.platformAPI.deleteVault(vaultId)
		if (result.error) {
			throw result
		}

		this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: vaultId,
				action: "delete"
			}
		})
	}

	async getVault(vaultId: string): Promise<Vault | null> {
		const result = await window.platformAPI.getVault(vaultId)
		if (result.error) {
			throw result
		}

		return result.result;
	}

	async getVaults(): Promise<Vault[]> {
		const result = await window.platformAPI.getVaults()
		if (result.error) {
			throw result
		}

		return result.result;
	}

	async openVault(vaultId: string) {
		const result = await window.platformAPI.openVault(vaultId)
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

	async openVaultNewWindow(vaultId: string) {
		const result = await window.platformAPI.openVaultNewWindow(vaultId)
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

	async getCurrentVault(): Promise<Vault | null> {
		const result = await window.platformAPI.getCurrentVault()
		if (result.error) {
			throw result
		}

		return result.result;
	}

	liveGetCurrentVault(subscriber: Subscriber<Vault | null>): Subscription {
		const runQuery = async () => {
			subscriber({status: SubscriptionResultStatus.LOADING})

			try {
				const currentVault = await this.getCurrentVault()
				subscriber({status: SubscriptionResultStatus.SUCCESS, result: currentVault })
			}
			catch (error) {
				subscriber({status: SubscriptionResultStatus.ERROR, errors: [error] })
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
