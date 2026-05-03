import {Observable} from "rxjs";

import {
	type CreateVaultDto,
	EventTypes,
	type IDeviceAPI,
	type IEventsService,
	type IVaultsAPI, LIVE_QUERY_LOADING_STATE, type LiveQueryResult,
	LiveQueryStatus, type UpdateVaultDto, type VaultChangeEvent, type VaultDto, VaultList
} from "@headbase-app/lib";


export class VaultsAPI implements IVaultsAPI {
	constructor(
		private readonly eventsService: IEventsService,
		private readonly deviceAPI: IDeviceAPI
	) {}

	async checkPermissions() {
		return true;
	}
	async requestPermissions() {
		return true
	}
	isLocationSelectable() {
		return true;
	}

	async selectLocation() {
		const platformResponse = await window.platformAPI.vaults_selectLocation()
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async create(createVaultDto: CreateVaultDto) {
		const platformResponse = await window.platformAPI.vaults_create(createVaultDto)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}

		const context = await this.deviceAPI.getCurrentContext()
		await this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
			context,
			data: {
				id: platformResponse.result.id,
				action: "create"
			}
		})

		return platformResponse.result
	}

	async update(id: string, updateVaultDto: UpdateVaultDto, preventEventDispatch?: boolean) {
		const platformResponse = await window.platformAPI.vaults_update(id, updateVaultDto)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}

		if (!preventEventDispatch) {
			const context = await this.deviceAPI.getCurrentContext()
			await this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
				context,
				data: {
					id: id,
					action: "update"
				}
			})
		}

		return platformResponse.result
	}

	async delete(id: string) {
		const platformResponse = await window.platformAPI.vaults_delete(id)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}

		const context = await this.deviceAPI.getCurrentContext()
		await this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
			context,
			data: {
				id: id,
				action: "delete"
			}
		})
	}

	async get(id: string) {
		const platformResponse = await window.platformAPI.vaults_get(id)
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async query() {
		const platformResponse = await window.platformAPI.vaults_query()
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	liveQuery() {
		return new Observable<LiveQueryResult<VaultList>>(observer => {
			observer.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING})

				try {
					const results = await this.query()
					observer.next({status: LiveQueryStatus.SUCCESS, result: results })
				}
				catch (error) {
					console.error(error)
					observer.next({status: LiveQueryStatus.ERROR, errors: [error] })
				}
			}

			this.eventsService.subscribe(EventTypes.VAULT_CHANGE, runQuery)
			runQuery()

			return {
				unsubscribe: () => {
					this.eventsService.unsubscribe(EventTypes.VAULT_CHANGE, runQuery)
				}
			}
		})
	}

	liveGet(vaultId: string) {
		return new Observable<LiveQueryResult<VaultDto | null>>((observer) => {
			observer.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING})
				try {
					const currentVault = await this.get(vaultId)
					observer.next({status: LiveQueryStatus.SUCCESS, result: currentVault })
				}
				catch (error) {
					console.error(error)
					observer.next({status: LiveQueryStatus.ERROR, errors: [error] })
				}
			}

			const handleEvent = async (e: VaultChangeEvent) => {
				if (e.detail.data.id === vaultId) {runQuery()}
			}

			this.eventsService.subscribe(EventTypes.VAULT_CHANGE, handleEvent)
			runQuery()

			return {
				unsubscribe: () => {
					this.eventsService.unsubscribe(EventTypes.VAULT_CHANGE, handleEvent)
				}
			}
		})
	}
}
