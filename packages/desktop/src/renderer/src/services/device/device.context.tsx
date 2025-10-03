import {createContext, useContext} from "react";
import {IDeviceService} from "./device.interface";

// todo: rename to prevent overlap with "device context" type
export interface DeviceContext {
	deviceService: IDeviceService
}

// no default is provided, instantiation is dependent on using the provider and injection
export const DeviceContext = createContext<DeviceContext>({} as DeviceContext)

export const useDeviceService = () => useContext(DeviceContext)
