import {createContext, useContext} from "solid-js";
import type {IVaultsAPI} from "@headbase-app/libweb";

export const VaultsServiceContext = createContext<IVaultsAPI>();

export function useVaultsService() {
	const context = useContext(VaultsServiceContext)
	if (!context) {
		throw new Error("VaultsService context requested but no value was provided.")
	}

	return context
}
