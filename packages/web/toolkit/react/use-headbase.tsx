import {HeadbaseWeb} from "../headbase-web";
import {TableSchemaDefinitions, TableTypeDefinitions} from "../storage/types/types";
import {EntityDatabase, EntityDatabaseConfig} from "../storage/entity-database/entity-database";
import {Context, createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState} from "react";
import {LocalDatabaseDto} from "../types/database";
import { LiveQueryStatus } from "../control-flow";
import {LocalUserDto} from "@headbase-toolkit/storage/general-storage";

export type HeadbaseContext<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>
> = {
	// Entity Database
	currentDatabase: EntityDatabase<TableTypes, TableSchemas> | null
	currentDatabaseDto?: LocalDatabaseDto
	closeCurrentDatabase: () => Promise<void>
	openDatabase: HeadbaseWeb<TableTypes, TableSchemas>['openDatabase']
	createDatabase: HeadbaseWeb<TableTypes, TableSchemas>['createDatabase']
	updateDatabase: HeadbaseWeb<TableTypes, TableSchemas>['updateDatabase']
	deleteDatabase: HeadbaseWeb<TableTypes, TableSchemas>['deleteDatabase']
	deleteLocalDatabase:  HeadbaseWeb<TableTypes, TableSchemas>['deleteLocalDatabase']
	changeDatabasePassword: HeadbaseWeb<TableTypes, TableSchemas>['changeDatabasePassword']
	unlockDatabase: HeadbaseWeb<TableTypes, TableSchemas>['unlockDatabase']
	lockDatabase: HeadbaseWeb<TableTypes, TableSchemas>['lockDatabase']
	liveQueryDatabase: HeadbaseWeb<TableTypes, TableSchemas>['liveQueryDatabase']
	liveGetDatabase: HeadbaseWeb<TableTypes, TableSchemas>['liveGetDatabase']
	// Server
	currentUser: LocalUserDto | null
	isUserLoading: boolean
	login: HeadbaseWeb<TableTypes, TableSchemas>['login'],
	logout: HeadbaseWeb<TableTypes, TableSchemas>['logout']
}

// eslint-disable-next-line -- can't know the generic type when declaring static variable. The useHeadbase hook can then accept the generic.
const HeadbaseContext = createContext<HeadbaseContext<any, any> | undefined>(undefined)

export function useHeadbase<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>
>() {
	const headbaseContext = useContext<HeadbaseContext<TableTypes, TableSchemas> | undefined>(
		HeadbaseContext as unknown as Context<HeadbaseContext<TableTypes, TableSchemas> | undefined>
	)
	if (!headbaseContext) {
		throw new Error('You attempted to use the Headbase context without using a Provider.')
	}

	return headbaseContext as unknown as HeadbaseContext<TableTypes, TableSchemas>
}

export interface HeadbaseContextProviderProps<
	TableTypes extends TableTypeDefinitions,
> extends PropsWithChildren {
	tableSchemas: EntityDatabaseConfig<TableTypes>['tableSchemas']
}

export function HeadbaseContextProvider<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>
>(props: HeadbaseContextProviderProps<TableTypes>) {
	const headbaseRef = useRef<HeadbaseWeb<TableTypes, TableSchemas>>()
	if (!headbaseRef.current) {
		headbaseRef.current = new HeadbaseWeb<TableTypes, TableSchemas>({tableSchemas: props.tableSchemas})
	}

	useEffect(() => {
		if (!headbaseRef.current) {
			headbaseRef.current = new HeadbaseWeb<TableTypes, TableSchemas>({tableSchemas: props.tableSchemas})
		}

		return () => {
			headbaseRef.current?.close()
			headbaseRef.current = undefined
		}
	}, []);

	const headbase: HeadbaseWeb<TableTypes, TableSchemas> = headbaseRef.current
		
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

		const newDatabase = await headbase.openDatabase(databaseId)
		setCurrentDatabase(newDatabase)

		return newDatabase
	}, [closeCurrentDatabase])

	const createDatabase = useCallback(headbase.createDatabase.bind(headbase), [])

	const updateDatabase = useCallback(headbase.updateDatabase.bind(headbase), [])

	const deleteDatabase = useCallback(async (databaseId: string) => {
		await _ensureDatabaseClosed(databaseId)
		return headbase.deleteDatabase(databaseId)
	}, [_ensureDatabaseClosed])

	const deleteLocalDatabase = useCallback(async (databaseId: string) => {
		await _ensureDatabaseClosed(databaseId)
		return headbase.deleteLocalDatabase(databaseId)
	}, [_ensureDatabaseClosed])

	const unlockDatabase = useCallback(headbase.unlockDatabase.bind(headbase), [])

	const lockDatabase = useCallback(async (databaseId: string) => {
		if (currentDatabase?.databaseId === databaseId) {
			await _ensureDatabaseClosed(databaseId)
		}
		return headbase.lockDatabase(databaseId)
	}, [_ensureDatabaseClosed])

	const changeDatabasePassword = useCallback(headbase.changeDatabasePassword.bind(headbase), [])

	const liveQueryDatabase = useCallback(headbase.liveQueryDatabase.bind(headbase), [])

	const liveGetDatabase = useCallback(headbase.liveGetDatabase.bind(headbase), [])

	// Automatically update the currentDatabaseDto state when the currentDatabase changes
	useEffect(() => {
		if (currentDatabase) {
			const dtoLiveQuery = headbase.liveGetDatabase(currentDatabase.databaseId)
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
		const query = headbase.liveGetCurrentUser()
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

	const login = useCallback(headbase.login.bind(headbase), [])
	const logout = useCallback(headbase.logout.bind(headbase), [])

	// todo: remove once units tests start to be written
	useEffect(() => {
		// @ts-expect-error -- adding custom property, so fine that it doesn't exist on window type.
		window.lf = headbase
	}, []);

	return <HeadbaseContext.Provider value={{
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
	}}>{props.children}</HeadbaseContext.Provider>
}
