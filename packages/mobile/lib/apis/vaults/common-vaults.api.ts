import {eq} from "drizzle-orm";
import {Observable} from "rxjs";

import {vaults} from "../database/schema";
import type {IDatabaseService} from "../database/database.service";
import type {IDeviceAPI} from "../device/device.api.ts";
import type {IEventsService} from "../events/events.service";
import type {IVaultsAPI} from "./vaults.api";
import {CreateVaultDto, VaultDto, UpdateVaultDto, VaultList} from "./vault.ts";
import {EventTypes, type VaultChangeEvent} from "../events/events";
import {
	ErrorTypes,
	HeadbaseError,
	LIVE_QUERY_LOADING_STATE,
	type LiveQueryResult,
	LiveQueryStatus
} from "../../control-flow";
import {ErrorIdentifiers} from "../../error-identifiers.ts";
import {EncryptionService} from "../encryption/encryption.service.ts";


export class CommonVaultsAPI implements IVaultsAPI {
	constructor(
		private readonly databaseService: IDatabaseService,
		private readonly deviceService: IDeviceAPI,
		private readonly eventsService: IEventsService
	) {}

	/**
	 * Create a new vault.
	 *
	 * @param createVaultDto
	 */
	async create(createVaultDto: CreateVaultDto) {
		const db = await this.databaseService.getDatabase()

		const id = EncryptionService.generateUUID();
		const timestamp = new Date().toISOString();

		const vault: VaultDto = {
			id,
			displayName: createVaultDto.displayName,
			path: createVaultDto.path,
			createdAt: timestamp,
			updatedAt: timestamp
		}

		await db.insert(vaults).values(vault)

		this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
			context: this.deviceService.getCurrentContext(),
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
		const db = await this.databaseService.getDatabase()
		const currentVault = await this.get(id)
		if (!currentVault) {
			throw new Error(ErrorIdentifiers.VAULT_NOT_FOUND)
		}

		const timestamp = new Date().toISOString();
		await db
			.update(vaults)
			.set({
				updatedAt: timestamp,
				displayName: updateVaultDto.displayName ?? currentVault.displayName,
				path: updateVaultDto.path ?? currentVault.path,
			})
			.where(eq(vaults.path, id))

		if (!preventEventDispatch) {
			this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
				context: this.deviceService.getCurrentContext(),
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
		// No need to actually access the db, but check it does exist.
		await this.get(id)

		const db = await this.databaseService.getDatabase()
		await db
			.delete(vaults)
			.where(eq(vaults.id, id))

		this.eventsService.dispatch(EventTypes.VAULT_CHANGE, {
			context: this.deviceService.getCurrentContext(),
			data: {
				id: id,
				action: "delete"
			}
		})
	}

	async get(id: string): Promise<VaultDto> {
		const db = await this.databaseService.getDatabase()
		const result = await db.select().from(vaults).where(eq(vaults.id, id))
		if (!result[0]) {
			throw new HeadbaseError({type: ErrorTypes.NOT_FOUND, devMessage: `vault ${id} not found`})
		}
		return result[0];
	}

	async query(): Promise<VaultList> {
		const db = await this.databaseService.getDatabase()
		return db.select().from(vaults);
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
