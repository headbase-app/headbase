import {createContext, useContext} from "solid-js";
import type {VaultsService} from "@api/vaults/vaults.service.ts";

export const VaultsServiceContext = createContext<VaultsService>();

export function useVaultsService() {
	const context = useContext(VaultsServiceContext)
	if (!context) {
		throw new Error("VaultsService context requested but no value was provided.")
	}

	return context
}
