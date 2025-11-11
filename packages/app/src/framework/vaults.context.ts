import {createContext, useContext} from "solid-js";
import type {VaultsAPI} from "@api/vaults/vaults.api.ts";

export const VaultsAPIContext = createContext<VaultsAPI>();

export function useVaultsAPI() {
	const context = useContext(VaultsAPIContext)
	if (!context) {
		throw new Error("VaultsAPI context requested but no value was provided.")
	}

	return context
}
