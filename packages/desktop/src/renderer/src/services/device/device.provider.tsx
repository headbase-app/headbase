import {type PropsWithChildren} from "react";
import {DeviceContext} from "./device.context";
import {IDeviceService} from "./device.interface";

export interface DeviceProviderProps extends PropsWithChildren {
	deviceService: IDeviceService;
}

export function DeviceProvider({children, deviceService}: DeviceProviderProps) {
	const value: DeviceContext = {
		deviceService,
	}

	return (
		<DeviceContext.Provider value={value}>
			{children}
		</DeviceContext.Provider>
	)
}
