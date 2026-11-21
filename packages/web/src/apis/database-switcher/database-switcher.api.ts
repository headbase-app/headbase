import {Observable} from "rxjs";

import type { IEventsService, IDeviceAPI, IDatabaseSwitcherAPI, IDatabaseManagerAPI, LiveQueryResult } from "@headbase-app/lib";
import { LiveQueryStatus, EventTypes, DatabaseDto } from "@headbase-app/lib";

export class WebDatabaseSwitcherAPI implements IDatabaseSwitcherAPI {
	constructor(
		private readonly eventsService: IEventsService,
		private readonly deviceService: IDeviceAPI,
		private readonly databaseManagerAPI: IDatabaseManagerAPI,
	) {
		this.setup()
	}

	async setup() {
		const params = new URLSearchParams(window.location.search);
		const databaseId = params.get("databaseId");
		const currentDatabase = await this.get()

		if (databaseId) {
			await this.open(databaseId)
		}
		else if (currentDatabase) {
			document.title = `${currentDatabase.displayName} | Headbase`
		}
	}

	async open(databaseId: string) {
		const currentDatabase = await this.get()
		const databaseToOpen = await this.databaseManagerAPI.get(databaseId)
		const context = await this.deviceService.getCurrentContext()

		if (currentDatabase) {
			await this.eventsService.dispatch(EventTypes.DATABASE_CLOSE, {
				context,
				data: {
					id: currentDatabase.path
				}
			})
		}
		if (databaseToOpen) {
			sessionStorage.setItem("hb_current_database", JSON.stringify(databaseToOpen));
			document.title = `${databaseToOpen.displayName} | Headbase`
			await this.eventsService.dispatch(EventTypes.DATABASE_OPEN, {
				context,
				data: {
					id: databaseId
				}
			})
		}
	}

	async openNewContext(databaseId: string) {
		// todo: trigger open in new tab (?databaseId=<uuid>)
		console.debug(`Triggered open in new context for ${databaseId}`)
	}

	async get(): Promise<DatabaseDto | null> {
		const currentDatabaseString = sessionStorage.getItem("hb_current_database");
		let currentDatabase: DatabaseDto | null
		if (currentDatabaseString) {
			try {
				currentDatabase = DatabaseDto.parse(JSON.parse(currentDatabaseString))
				return currentDatabase;
			}
			catch (error) {
				console.error("hb_current_database found to be corrupted, ignoring.");
				sessionStorage.removeItem("hb_current_database");
			}
		}
		return null;
	}

	async close() {
		const currentDatabase = await this.get()
		if (!currentDatabase) {
			throw new Error(`no database is currently open`)
		}

		sessionStorage.removeItem("hb_current_database");
		const context = await this.deviceService.getCurrentContext()
		await this.eventsService.dispatch(EventTypes.DATABASE_CLOSE, {
			context,
			data: {
				id: currentDatabase.path
			}
		})
	}

	liveGet() {
		return new Observable<LiveQueryResult<DatabaseDto | null>>((observer) => {
			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING, result: null})

				try {
					const currentDatabase = await this.get()
					observer.next({status: LiveQueryStatus.SUCCESS, result: currentDatabase })
				}
				catch (error) {
					observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null })
				}
			}

			this.eventsService.subscribe(EventTypes.DATABASE_OPEN, runQuery)
			this.eventsService.subscribe(EventTypes.DATABASE_CLOSE, runQuery)
			this.eventsService.subscribe(EventTypes.DATABASE_CHANGE, runQuery)
			runQuery()

			return {
				unsubscribe: () => {
					this.eventsService.unsubscribe(EventTypes.DATABASE_OPEN, runQuery)
					this.eventsService.unsubscribe(EventTypes.DATABASE_CLOSE, runQuery)
					this.eventsService.unsubscribe(EventTypes.DATABASE_CHANGE, runQuery)
				}
			}
		})
	}
}
