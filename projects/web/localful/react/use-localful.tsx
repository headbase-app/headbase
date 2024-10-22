import {LocalfulWeb} from "../localful-web";
import {TableSchemaDefinitions, TableTypeDefinitions} from "../storage/types/types";
import {EntityDatabase, EntityDatabaseConfig} from "../storage/entity-database/entity-database";
import { Context, createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import {LocalDatabaseDto} from "../types/database";
import { LiveQueryStatus } from "../control-flow";
import {UserDto} from "@localful/common";
import {LocalUserDto} from "@localful-headbase/storage/general-storage";

export type LocalfulContext<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>
> = {
	// Entity Database
	currentDatabase: EntityDatabase<TableTypes, TableSchemas> | null
	currentDatabaseDto?: LocalDatabaseDto
	closeCurrentDatabase: () => Promise<void>
	openDatabase: LocalfulWeb<TableTypes, TableSchemas>['openDatabase']
	createDatabase: LocalfulWeb<TableTypes, TableSchemas>['createDatabase']
	updateDatabase: LocalfulWeb<TableTypes, TableSchemas>['updateDatabase']
	deleteDatabase: LocalfulWeb<TableTypes, TableSchemas>['deleteDatabase']
	deleteLocalDatabase:  LocalfulWeb<TableTypes, TableSchemas>['deleteLocalDatabase']
	changeDatabasePassword: LocalfulWeb<TableTypes, TableSchemas>['changeDatabasePassword']
	unlockDatabase: LocalfulWeb<TableTypes, TableSchemas>['unlockDatabase']
	lockDatabase: LocalfulWeb<TableTypes, TableSchemas>['lockDatabase']
	liveQueryDatabase: LocalfulWeb<TableTypes, TableSchemas>['liveQueryDatabase']
	liveGetDatabase: LocalfulWeb<TableTypes, TableSchemas>['liveGetDatabase']
	// Server
	currentUser: LocalUserDto | null
	isUserLoading: boolean
	login: LocalfulWeb<TableTypes, TableSchemas>['login'],
	logout: LocalfulWeb<TableTypes, TableSchemas>['logout']
}

// eslint-disable-next-line -- can't know the generic type when declaring static variable. The useLocalful hook can then accept the generic.
const LocalfulContext = createContext<LocalfulContext<any, any> | undefined>(undefined)

export function useLocalful<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>
>() {
	const localfulContext = useContext<LocalfulContext<TableTypes, TableSchemas> | undefined>(
		LocalfulContext as unknown as Context<LocalfulContext<TableTypes, TableSchemas> | undefined>
	)
	if (!localfulContext) {
		throw new Error('You attempted to use the Localful context without using a Provider.')
	}

	return localfulContext as unknown as LocalfulContext<TableTypes, TableSchemas>
}

export interface LocalfulContextProviderProps<
	TableTypes extends TableTypeDefinitions,
> extends PropsWithChildren {
	tableSchemas: EntityDatabaseConfig<TableTypes>['tableSchemas']
}

export function LocalfulContextProvider<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>
>(props: LocalfulContextProviderProps<TableTypes>) {
	const [localful] = useState(() => new LocalfulWeb<TableTypes, TableSchemas>({
		tableSchemas: props.tableSchemas
	}))
	const [currentDatabase, setCurrentDatabase] = useState<null | EntityDatabase<TableTypes, TableSchemas>>(null)

	const [currentDatabaseDto, setCurrentDatabaseDto] = useState<LocalDatabaseDto | undefined>(undefined)

	const _ensureDatabaseClosed = useCallback(async (databaseId: string) => {
		if (currentDatabase?.databaseId === databaseId) {
			await currentDatabase.close()
			setCurrentDatabase(() => {return null})
		}
	}, [currentDatabase])

	const closeCurrentDatabase = useCallback(async () => {
		if (currentDatabase) {
			await currentDatabase.close()
		}
	}, [currentDatabase])

	const openDatabase = useCallback(async (databaseId: string): Promise<EntityDatabase<TableTypes, TableSchemas> | null> => {
		await closeCurrentDatabase()

		const newDatabase = await localful.openDatabase(databaseId)
		setCurrentDatabase(newDatabase)

		return newDatabase
	}, [closeCurrentDatabase])

	const createDatabase = useCallback(localful.createDatabase.bind(localful), [])

	const updateDatabase = useCallback(localful.updateDatabase.bind(localful), [])

	const deleteDatabase = useCallback(async (databaseId: string) => {
		await _ensureDatabaseClosed(databaseId)
		return localful.deleteDatabase(databaseId)
	}, [_ensureDatabaseClosed])

	const deleteLocalDatabase = useCallback(async (databaseId: string) => {
		await _ensureDatabaseClosed(databaseId)
		return localful.deleteLocalDatabase(databaseId)
	}, [_ensureDatabaseClosed])

	const unlockDatabase = useCallback(localful.unlockDatabase.bind(localful), [])

	const lockDatabase = useCallback(async (databaseId: string) => {
		if (currentDatabase?.databaseId === databaseId) {
			await _ensureDatabaseClosed(databaseId)
		}
		return localful.lockDatabase(databaseId)
	}, [_ensureDatabaseClosed])

	const changeDatabasePassword = useCallback(localful.changeDatabasePassword.bind(localful), [])

	const liveQueryDatabase = useCallback(localful.liveQueryDatabase.bind(localful), [])

	const liveGetDatabase = useCallback(localful.liveGetDatabase.bind(localful), [])

	// Automatically update the currentDatabaseDto state when the currentDatabase changes
	useEffect(() => {
		if (currentDatabase) {
			const dtoLiveQuery = localful.liveGetDatabase(currentDatabase.databaseId)
			const dtoSubscription = dtoLiveQuery.subscribe((liveQuery) => {
				if (liveQuery.status === LiveQueryStatus.SUCCESS) {
					setCurrentDatabaseDto(liveQuery.result)
				}
				else if (liveQuery.status === LiveQueryStatus.ERROR) {
					console.error(liveQuery.errors)
					setCurrentDatabaseDto(undefined)
				}
			})

			return () => {
				dtoSubscription.unsubscribe()
			}

		} else {
			setCurrentDatabaseDto(undefined)
		}
	}, [currentDatabase])

	const [currentUser, setCurrentUser] = useState<LocalUserDto|null>(null)
	const [isUserLoading, setIsUserLoading] = useState(true)
	useEffect(() => {
		const query = localful.liveGetCurrentUser()
		const querySubscription = query.subscribe((liveQuery) => {
			if (liveQuery.status === LiveQueryStatus.SUCCESS) {
				setCurrentUser(liveQuery.result)
				setIsUserLoading(false)
			}
			else if (liveQuery.status === LiveQueryStatus.ERROR) {
				console.error(liveQuery.errors)
				setCurrentUser(null)
				setIsUserLoading(false)
			}
			else {
				setIsUserLoading(true)
			}
		})

		return () => {
			querySubscription.unsubscribe()
		}
	}, []);

	const login = useCallback(localful.login.bind(localful), [])
	const logout = useCallback(localful.logout.bind(localful), [])

	// todo: remove once units tests start to be written
	useEffect(() => {
		// @ts-expect-error -- adding custom property, so fine that it doesn't exist on window type.
		window.lf = localful
	}, []);

	return <LocalfulContext.Provider value={{
		// Entity Database
		currentDatabase,
		currentDatabaseDto,
		openDatabase,
		closeCurrentDatabase,
		createDatabase,
		updateDatabase,
		deleteDatabase,
		deleteLocalDatabase,
		unlockDatabase,
		lockDatabase,
		changeDatabasePassword,
		liveQueryDatabase,
		liveGetDatabase,
		// User
		currentUser,
		isUserLoading,
		login,
		logout,
	}}>{props.children}</LocalfulContext.Provider>
}
