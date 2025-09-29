import {Context, createContext, PropsWithChildren, useContext, useState} from "react";
import {Headbase} from "../app.ts";

export type HeadbaseContext = {
	headbase: Headbase
	currentDatabaseId: string | null
	setCurrentDatabaseId: (currentDatabaseId: string) => void
}

 
const HeadbaseContext = createContext<HeadbaseContext | undefined>(undefined)

export function useHeadbase() {
	const headbaseContext = useContext<HeadbaseContext | undefined>(
		HeadbaseContext as unknown as Context<HeadbaseContext | undefined>
	)
	if (!headbaseContext) {
		throw new Error('You attempted to use the Headbase context outside the Provider.')
	}

	return headbaseContext as unknown as HeadbaseContext
}

export type HeadbaseContextProviderProps = PropsWithChildren & {
	headbase: Headbase
}

export function HeadbaseContextProvider(props: HeadbaseContextProviderProps) {
	const [currentDatabaseId, setCurrentDatabaseId] = useState<string|null>(null)

	return <HeadbaseContext.Provider value={{
		headbase: props.headbase,
		currentDatabaseId,
		setCurrentDatabaseId,
	}}>{props.children}</HeadbaseContext.Provider>
}
