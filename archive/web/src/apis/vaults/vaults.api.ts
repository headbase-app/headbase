import {Observable} from "rxjs";
import * as opfsx from "opfsx"
import {ZodError} from "zod";

import {
	type CreateVaultDto,
	EncryptionService, ErrorIdentifiers, EventTypes, HeadbaseError,
	type IDeviceAPI,
	type IEventsService,
	type IVaultsAPI, LIVE_QUERY_LOADING_STATE, type LiveQueryResult,
	LiveQueryStatus, type UpdateVaultDto, type VaultChangeEvent, type VaultDto, VaultList
} from "../../../../lib/dist";

const VAULTS_PATH = "/headbase-v1/vaults.json"

export class VaultsAPI implements IVaultsAPI {
	constructor(
		private readonly eventsService: IEventsService,
		private readonly deviceService: IDeviceAPI
	) {}

	async #load() {
		let vaults: VaultList = []
		try {
			const file = await opfsx.read("/headbase-v1/vaults.json")
			const text = await file.text()
			vaults = VaultList.parse(JSON.parse(text))
		}
		catch (error) {
			if (error instanceof DOMException) {
				console.warn(`No vaults file found (/headbase-v1/vaults.json), returning empty list.`)
			}
			else if (error instanceof ZodError) {
				console.warn(`Vaults file failed validation, returning empty list.`)
			}
		}
		return vaults
	}

	async #save(vaults: VaultList) {
		await opfsx.write(VAULTS_PATH, JSON.stringify(vaults))
	}

	isLocationSelectable(): boolean {
		return false;
	}
	async selectLocation(): Promise<string|null> {
		throw new Error("Selecting vault location is not supported on the web platform.")
	}

	async checkPermissions(): Promise<boolean> {
		return true;
	}
	async requestPermissions(): Promise<boolean> {
		return true
	}

	/**
	 * Create a new vault.
	 */
	async create(createVaultDto: CreateVaultDto) {
		const id = EncryptionService.generateUUID();
		const timestamp = new Date().toISOString();

		const vault: VaultDto = {
			id,
			displayName: createVaultDto.displayName,
			path: createVaultDto.path,
			createdAt: timestamp,
			updatedAt: timestamp
		}

		// todo: validate for existing ID
		const vaults = await this.#load()
		vaults.push(vault)
		await this.#save(vaults)

		const context = await this.deviceService.getCurrentContext()
		await this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
			context,
			data: {
				id,
				action: "create"
			}
		})

		return vault;
	}

	/**
	 * Update the given vault.
	 *
	 * @param id
	 * @param updateVaultDto
	 * @param preventEventDispatch - Prevent an update event being dispatched.
	 */
	async update(id: string, updateVaultDto: UpdateVaultDto, preventEventDispatch?: boolean) {
		const currentVault = await this.get(id)
		if (!currentVault) {
			throw new HeadbaseError({type: ErrorIdentifiers.VAULT_NOT_FOUND, devMessage: `vault ${id} not found`})
		}

		const timestamp = new Date().toISOString();

		// todo: validate for existing ID
		const vaults = await this.#load()
		await this.#save(vaults.map(vault => {
			if (vault.id === id) {
				return {
					...vault,
					updatedAt: timestamp,
					displayName: updateVaultDto.displayName ?? currentVault.displayName,
					path: updateVaultDto.path ?? currentVault.path,
				}
			}
			return vault
		}))

		if (!preventEventDispatch) {
			const context = await this.deviceService.getCurrentContext()
			await this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
				context,
				data: {
					id: id,
					action: "update"
				}
			})
		}

		return {
			...currentVault,
			displayName: updateVaultDto.displayName ?? currentVault.displayName,
			path: updateVaultDto.path ?? currentVault.path,
		};
	}

	/**
	 * Delete the given vault.
	 */
	async delete(id: string) {
		const currentVault = await this.get(id)
		if (!currentVault) {
			throw new HeadbaseError({type: ErrorIdentifiers.VAULT_NOT_FOUND, devMessage: `vault ${id} not found`})
		}

		const vaults = await this.#load()
		await this.#save(vaults.filter(vault => vault.id !== id))

		const context = await this.deviceService.getCurrentContext()
		await this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
			context,
			data: {
				id: id,
				action: "delete"
			}
		})
	}

	async get(id: string): Promise<VaultDto|null> {
		const vaults = await this.#load()
		const result = await vaults.find(vault => vault.id === id)
		return result ?? null;
	}

	async query(): Promise<VaultList> {
		return this.#load()
	}

	liveQuery() {
		return new Observable<LiveQueryResult<VaultList>>(observer => {
			observer.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING, result: null})

				try {
					const results = await this.query()
					observer.next({status: LiveQueryStatus.SUCCESS, result: results })
				}
				catch (error) {
					console.error(error)
					observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null})
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
				observer.next({status: LiveQueryStatus.LOADING, result: null})
				try {
					const currentVault = await this.get(vaultId)
					observer.next({status: LiveQueryStatus.SUCCESS, result: currentVault })
				}
				catch (error) {
					console.error(error)
					observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null })
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
