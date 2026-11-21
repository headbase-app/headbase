import {Observable} from "rxjs";
import {ZodError} from "zod";

import {
	type CreateDatabaseDto,
	ErrorIdentifiers, EventTypes, HeadbaseError,
	type IDeviceAPI,
	type IEventsService,
	type IDatabaseManagerAPI, LIVE_QUERY_LOADING_STATE, type LiveQueryResult,
	LiveQueryStatus, type UpdateDatabaseDto, type DatabaseChangeEvent, type DatabaseDto, DatabaseListDto
} from "@headbase-app/lib";

const STORAGE_KEY = "hb_databases"

export class WebDatabaseManagerAPI implements IDatabaseManagerAPI {
	constructor(
		private readonly eventsService: IEventsService,
		private readonly deviceService: IDeviceAPI
	) {}

	async #load() {
		let databases: DatabaseListDto = []
		try {
			const data = localStorage.getItem(STORAGE_KEY)
			if (data) {
				databases = DatabaseListDto.parse(JSON.parse(data))
			}
		}
		catch (error) {
			if (error instanceof DOMException) {
				console.warn(`No databases data found in local storage, returning empty list.`)
			}
			else if (error instanceof ZodError) {
				console.warn(`databases data failed validation, returning empty list.`)
			}
		}
		return databases
	}

	async #save(databases: DatabaseListDto) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(databases))
	}

	isLocationSelectable(): boolean {
		return false;
	}
	async selectLocation(): Promise<string|null> {
		throw new Error("Selecting database location is not supported on the web platform.")
	}

	/**
	 * Create a new database.
	 */
	async create(database: CreateDatabaseDto) {
		// todo: validate for existing path
		const databases = await this.#load()
		databases.push(database)
		await this.#save(databases)

		const context = await this.deviceService.getCurrentContext()
		await this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context,
			data: {
				id: database.id,
				action: "create"
			}
		})

		return database;
	}

	/**
	 * Update the given database.
	 *
	 * @param id
	 * @param updateDatabaseDto
	 * @param preventEventDispatch - Prevent an update event being dispatched.
	 */
	async update(id: string, updateDatabaseDto: UpdateDatabaseDto, preventEventDispatch?: boolean) {
		const currentDatabase = await this.get(id)
		if (!currentDatabase) {
			throw new HeadbaseError({type: ErrorIdentifiers.DATABASE_NOT_FOUND, devMessage: `database ${id} not found`})
		}

		const updatedDatabase = {
			...currentDatabase,
			...updateDatabaseDto,
		}

		// todo: validate for existing path
		const databases = await this.#load()
		await this.#save(databases.map(database => {
			if (database.path === id) {
				return updatedDatabase
			}
			return database
		}))

		if (!preventEventDispatch) {
			const context = await this.deviceService.getCurrentContext()
			await this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
				context,
				data: {
					id: id,
					action: "update"
				}
			})
		}

		return updatedDatabase;
	}

	/**
	 * Delete the given database.
	 */
	async delete(id: string) {
		const currentDatabase = await this.get(id)
		if (!currentDatabase) {
			throw new HeadbaseError({type: ErrorIdentifiers.DATABASE_NOT_FOUND, devMessage: `database ${id} not found`})
		}

		const databases = await this.#load()
		await this.#save(databases.filter(database => database.path !== id))

		const context = await this.deviceService.getCurrentContext()
		await this.eventsService.dispatch(EventTypes.DATABASE_CHANGE, {
			context,
			data: {
				id: id,
				action: "delete"
			}
		})
	}

	async get(id: string): Promise<DatabaseDto|null> {
		const databases = await this.#load()
		const result = databases.find(database => database.id === id)
		return result ?? null;
	}

	async query(): Promise<DatabaseListDto> {
		return this.#load()
	}

	liveQuery() {
		return new Observable<LiveQueryResult<DatabaseListDto>>(observer => {
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

			this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, runQuery)
			runQuery()

			return {
				unsubscribe: () => {
					this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, runQuery)
				}
			}
		})
	}

	liveGet(databaseId: string) {
		return new Observable<LiveQueryResult<DatabaseDto | null>>((observer) => {
			observer.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING, result: null})
				try {
					const currentDatabase = await this.get(databaseId)
					observer.next({status: LiveQueryStatus.SUCCESS, result: currentDatabase })
				}
				catch (error) {
					console.error(error)
					observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null })
				}
			}

			const handleEvent = async (e: DatabaseChangeEvent) => {
				if (e.detail.data.id === databaseId) {runQuery()}
			}

			this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, handleEvent)
			runQuery()

			return {
				unsubscribe: () => {
					this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, handleEvent)
				}
			}
		})
	}
}
