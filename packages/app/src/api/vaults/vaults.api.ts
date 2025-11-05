import {CreateVaultDto, UpdateVaultDto, LocalVaultDto} from "@contracts/vaults";
import type {IEventsAPI} from "@api/events/events.interface";
import type {IVaultsAPI} from "@api/vaults/vaults.interface";
import type {IDeviceAPI} from "@api/device/device.interface";
import {type DatabaseChangeEvent, EventTypes} from "@api/events/events";
import {LiveQueryStatus, type LiveQuerySubscriber, type LiveQuerySubscription} from "@contracts/query";

export class VaultsAPI implements IVaultsAPI {
	constructor(
		private readonly deviceService: IDeviceAPI,
		private readonly eventsService: IEventsAPI
	) {}

	async create(createVaultDto: CreateVaultDto) {
		const result = await window.platformAPI.vaults_create({
			// @ts-ignore -- fix api interface
			id: window.crypto.randomUUID(),
			...createVaultDto,
		})
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

	async update(vaultId: string, updateVaultDto: UpdateVaultDto) {
		const result = await window.platformAPI.vaults_update(vaultId, updateVaultDto)
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

	async delete(vaultId: string) {
		const result = await window.platformAPI.vaults_delete(vaultId)
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

	async get(vaultId: string): Promise<LocalVaultDto | null> {
		const result = await window.platformAPI.vaults_get(vaultId)
		if (result.error) {
			throw result
		}

		return result.result;
	}

	async query(): Promise<LocalVaultDto[]> {
		const result = await window.platformAPI.vaults_query()
		if (result.error) {
			throw result
		}

		return result.result;
	}

	liveQuery(subscriber: LiveQuerySubscriber<LocalVaultDto[]>): LiveQuerySubscription {
		const runQuery = async () => {
			subscriber({status: LiveQueryStatus.LOADING})

			try {
				const currentVault = await this.query()
				subscriber({status: LiveQueryStatus.SUCCESS, result: currentVault })
			}
			catch (error) {
				subscriber({status: LiveQueryStatus.ERROR, errors: [error] })
			}
		}

		const handleEvent = async () => {
			runQuery()
		}

		this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
		runQuery()

		return {
			unsubscribe: () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			}
		}
	}

	liveGet(vaultId: string, subscriber: LiveQuerySubscriber<LocalVaultDto | null>): LiveQuerySubscription {
		const runQuery = async () => {
			subscriber({status: LiveQueryStatus.LOADING})

			try {
				const currentVault = await this.get(vaultId)
				subscriber({status: LiveQueryStatus.SUCCESS, result: currentVault })
			}
			catch (error) {
				subscriber({status: LiveQueryStatus.ERROR, errors: [error] })
			}
		}

		const handleEvent = async (e: DatabaseChangeEvent) => {
			if (e.detail.data.id === vaultId) {
				runQuery()
			}
		}

		this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
		runQuery()

		return {
			unsubscribe: () => {
				this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			}
		}
	}
}
