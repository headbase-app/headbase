import {createContext, useContext} from "solid-js";
import type {CurrentVaultService} from "@api/current-vault/current-vault.service.ts";

export const CurrentVaultServiceContext = createContext<CurrentVaultService>();

export function useCurrentVaultService() {
	const context = useContext(CurrentVaultServiceContext)
	if (!context) {
		throw new Error("CurrentVaultService context requested but no value was provided.")
	}

	return context
}
