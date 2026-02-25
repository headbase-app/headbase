import {drizzle, type SqliteRemoteDatabase} from "drizzle-orm/sqlite-proxy";
import {SQLiteDBConnection, CapacitorSQLite, SQLiteConnection} from "@capacitor-community/sqlite";
import {type IDatabaseService, schema} from "@headbase-app/libweb"

import migration0 from "../../../../lib/services/database/migrations/00-setup.sql?raw"

type DrizzleDriverMethod = 'run'|'all'|'values'|'get'
type DrizzleDriverReturn = { rows: any[] | any[][] }


class MobileDatabaseService implements IDatabaseService {
	#connection?: SQLiteDBConnection
	#db?: SqliteRemoteDatabase<typeof schema>

	async getDatabase() {
		if (this.#db) {return this.#db}

		// Using lock to ensure multiple concurrent calls to getDatabase don't both try to initialize the database.
		return await navigator.locks.request("database_init", async () => {
			if (this.#db) return this.#db

			console.debug("[database] Initializing database")

			const DATABASE_NAME = "app-database"
			let dbConnection: SQLiteDBConnection
			const sqliteConnection = new SQLiteConnection(CapacitorSQLite)

			const isConsistent = (await sqliteConnection.checkConnectionsConsistency()).result ?? false
			const isConnection = (await sqliteConnection.isConnection(DATABASE_NAME, false)).result ?? false
			if (isConsistent && isConnection) {
				console.debug("[database] Retrieving existing connection")
				dbConnection = await sqliteConnection.retrieveConnection(DATABASE_NAME, false)
			}
			else {
				console.debug("[database] Creating new connection")
				dbConnection = await sqliteConnection.createConnection(DATABASE_NAME, false, '', 1, false)
			}
			await dbConnection.open()
			console.debug("[database] Opened database successfully")

			this.#connection = dbConnection;
			this.#db = drizzle(this.#driver.bind(this), this.#batchDriver.bind(this), {casing: "snake_case"});

			await this.#runMigrations()

			return this.#db;
		})
	}

	#mapResultsToDrizzle(method: DrizzleDriverMethod, results: any[]): DrizzleDriverReturn {
		const rows = results.map((result) => {
			return Object.values(result)
		})

		return method === 'all' ? {rows} : {rows: rows[0]}
	}

	/**
	 * https://github.com/capacitor-community/sqlite/blob/master/docs/API.md#sqlite-commands-within-the-plugin
	 * The method used for SQL queries needs to change between .execute, .run and .query.
	 *
	 * todo: feels like a clunky API and detection of request type in driver could cause issues.
	 *
	 * @param sql
	 * @param params
	 * @param method
	 */
	async #driver(sql: string, params: any[], method: DrizzleDriverMethod): Promise<DrizzleDriverReturn> {
		if (!this.#connection) {
			throw new Error("[database] attempted to use driver with no active connection")
		}

		if (sql.startsWith("select") || sql.startsWith("SELECT")) {
			console.debug("[database] Detected SELECT query, using .query")
			const result = await this.#connection.query(sql, params)

			if (!result.values) {
				console.warn("[database] Ran SELECT .query but received no return values")
				return this.#mapResultsToDrizzle(method, [])
			}
			return this.#mapResultsToDrizzle(method, result.values)
		}

		console.debug("[database] Detected none SELECT query, using .run")
		const result = await this.#connection.run(sql, params)

		if (!result.changes?.values) {
			console.warn("[database] Ran query but received no return values")
			return this.#mapResultsToDrizzle(method, [])
		}
		return this.#mapResultsToDrizzle(method, result.changes?.values)
	}

	async #batchDriver(): Promise<{ rows: any[]; }[]> {
		throw new Error("[database] Attempted to use batch driver but this is not implemented.");
	}

	async #getDatabaseVersion(): Promise<number | null> {
		const result = await this.#connection!.query("PRAGMA user_version")
		if (Array.isArray(result.values) && typeof result?.values[0]?.user_version === 'number') {
			return result?.values[0]?.user_version
		}
		return null
	}

	async #setDatabaseVersion(version: number) {
		await this.#connection!.execute(`PRAGMA user_version = ${version}`)
	}

	async #runMigrations() {
		if (!this.#connection) {
			throw new Error("[database] Attempted to run migrations with no active connection")
		}
		console.debug("[database] Running migrations")

		let databaseVersion = await this.#getDatabaseVersion()
		console.debug(`[database] Detected user_version ${JSON.stringify(databaseVersion)}`)

		await this.#connection.execute(migration0);

		await this.#setDatabaseVersion(0)
		console.debug(`[database] Finished running migrations, set user_version to 0`)
	}

	async destroy() {
		await this.#connection?.close()
	}
}

export default MobileDatabaseService
