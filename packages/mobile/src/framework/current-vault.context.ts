import {createContext, useContext} from "solid-js";
import type {IWorkspaceVaultAPI} from "@headbase-app/libweb";

export const CurrentVaultServiceContext = createContext<IWorkspaceVaultAPI>();

export function useCurrentVaultService() {
	const context = useContext(CurrentVaultServiceContext)
	if (!context) {
		throw new Error("CurrentVaultService context requested but no value was provided.")
	}

	return context
}
