import {createContext, useContext} from "solid-js";
import type {IWorkspaceVaultAPI} from "@headbase-app/libweb";

export const WorkspaceVaultAPIContext = createContext<IWorkspaceVaultAPI>();

export function useWorkspaceVaultAPI() {
	const context = useContext(WorkspaceVaultAPIContext)
	if (!context) {
		throw new Error("WorkspaceVaultAPI context requested but no value was provided.")
	}

	return context
}
