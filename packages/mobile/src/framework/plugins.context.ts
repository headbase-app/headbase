import {createContext, useContext} from "solid-js";
import type {IPluginAPI} from "@headbase-app/libweb";

export const PluginAPIContext = createContext<IPluginAPI>();

export function usePluginsAPI() {
	const context = useContext(PluginAPIContext)
	if (!context) {
		throw new Error("PluginsAPI context requested but no value was provided.")
	}

	return context
}
