import type {IEventsService} from "@api/events/events.interface";
import {EventTypes} from "@api/events/events";
import type {IDeviceService} from "@api/device/device.interface";
import type {ICurrentVaultService} from "@api/current-vault/current-vault.interface";
import {LiveQueryStatus, type LiveQuerySubscriber, type LiveQuerySubscription} from "@contracts/query";
import {LocalVaultDto} from "@api/vaults/local-vault.ts";
import type {IVaultsService} from "@api/vaults/vaults.interface.ts";

export class CurrentVaultService implements ICurrentVaultService {
	constructor(
		private readonly deviceService: IDeviceService,
		private readonly eventsService: IEventsService,
		private readonly vaultsService: IVaultsService,
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
			document.title = `${currentVault.name} | Headbase`
		}
	}

	async open(vaultId: string) {
		const currentVault = await this.get()
		const vaultToOpen = await this.vaultsService.get(vaultId)

		if (currentVault) {
			this.eventsService.dispatch(EventTypes.DATABASE_CLOSE, {
				context: this.deviceService.getCurrentContext(),
				data: {
					id: currentVault.id
				}
			})
		}
		if (vaultToOpen) {
			sessionStorage.setItem("hb_current_vault", JSON.stringify(vaultToOpen));
			document.title = `${vaultToOpen.name} | Headbase`
			this.eventsService.dispatch(EventTypes.DATABASE_OPEN, {
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

	async get(): Promise<LocalVaultDto | null> {
		const currentVaultString = sessionStorage.getItem("hb_current_vault");
		let currentVault: LocalVaultDto | null
		if (currentVaultString) {
			try {
				currentVault = LocalVaultDto.parse(JSON.parse(currentVaultString))
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
