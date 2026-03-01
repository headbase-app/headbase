import {createContext, useContext} from "solid-js";
import type {IDeviceAPI} from "@headbase-app/libweb";

export const DeviceAPIContext = createContext<IDeviceAPI>();

export function useDeviceAPI() {
	const context = useContext(DeviceAPIContext)
	if (!context) {
		throw new Error("DeviceAPI context requested but no value was provided.")
	}

	return context
}
