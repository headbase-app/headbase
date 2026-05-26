import {createContext, useContext} from "solid-js";
import type {IPluginStore} from "../02-apis/plugin/plugin.api";

export const PluginAPIContext = createContext<IPluginStore>();

export function usePluginsAPI() {
	const context = useContext(PluginAPIContext)
	if (!context) {
		throw new Error("PluginsAPI context requested but no value was provided.")
	}

	return context
}
