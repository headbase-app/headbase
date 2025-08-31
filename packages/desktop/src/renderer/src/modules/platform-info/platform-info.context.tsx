import {createContext, useContext} from "react";
import {IPlatformInfoService} from "@renderer/modules/platform-info/platform-info.interface";

export interface PlatformInfoContext {
	platformInfoService: IPlatformInfoService
}

// no default is provided, instantiation is dependent on using the provider and injection
export const PlatformInfoContext = createContext<PlatformInfoContext>({} as PlatformInfoContext)

export const usePlatformInfoService = () => useContext(PlatformInfoContext)
