import {HeadbaseWeb} from "../headbase-web";
import {Context, createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {TransactionsAPIConfig} from "../apis/transactions/transactions";
import {TableSchemaDefinitions, TableTypeDefinitions} from "@headbase-toolkit/schemas/tables";

export type HeadbaseContext<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>
> = {
	headbase: HeadbaseWeb<TableTypes, TableSchemas> | null
	currentDatabaseId: string | null
	setCurrentDatabaseId: (currentDatabaseId: string) => void
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
	tableSchemas: TransactionsAPIConfig<TableTypes>['tableSchemas']
}

export function HeadbaseContextProvider<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>
>(props: HeadbaseContextProviderProps<TableTypes>) {
	const [headbase, setHeadbase] = useState<HeadbaseWeb<TableTypes, TableSchemas> | null>(null)

	useEffect(() => {
		if (!headbase) {
			console.debug('HeadbaseWeb init in hook')
			const instance = new HeadbaseWeb<TableTypes, TableSchemas>({tableSchemas: props.tableSchemas})
			setHeadbase(instance)
			// @ts-expect-error -- adding custom to window so fine
			window.hb = headbase

			return () => {
				console.debug('HeadbaseWeb hook cleanup')
				instance.close()
			}
		}
	}, []);

	const [currentDatabaseId, setCurrentDatabaseId] = useState<string|null>(null)

	return <HeadbaseContext.Provider value={{
		headbase,
		currentDatabaseId,
		setCurrentDatabaseId,
	}}>{props.children}</HeadbaseContext.Provider>
}
