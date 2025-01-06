import {HeadbaseWeb} from "../headbase-web.ts";
import {Context, createContext, PropsWithChildren, useContext, useEffect, useState} from "react";

export type HeadbaseContext = {
	headbase: HeadbaseWeb | null
	currentDatabaseId: string | null
	setCurrentDatabaseId: (currentDatabaseId: string) => void
}

 
const HeadbaseContext = createContext<HeadbaseContext | undefined>(undefined)

export function useHeadbase() {
	const headbaseContext = useContext<HeadbaseContext | undefined>(
		HeadbaseContext as unknown as Context<HeadbaseContext | undefined>
	)
	if (!headbaseContext) {
		throw new Error('You attempted to use the Headbase context without using a Provider.')
	}

	return headbaseContext as unknown as HeadbaseContext
}

export type HeadbaseContextProviderProps = PropsWithChildren

export function HeadbaseContextProvider(props: HeadbaseContextProviderProps) {
	const [headbase, setHeadbase] = useState<HeadbaseWeb | null>(null)

	useEffect(() => {
		if (!headbase) {
			const instance = new HeadbaseWeb()
			setHeadbase(instance)
			// @ts-expect-error -- adding custom to window so fine
			window.hb = instance

			return () => {
				instance.destroy()
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
