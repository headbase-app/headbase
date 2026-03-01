import {createContext, useContext} from "solid-js";
import type {IVaultsAPI} from "@headbase-app/libweb";

export const VaultsAPIContext = createContext<IVaultsAPI>();

export function useVaultsAPI() {
	const context = useContext(VaultsAPIContext)
	if (!context) {
		throw new Error("VaultsAPI context requested but no value was provided.")
	}

	return context
}
