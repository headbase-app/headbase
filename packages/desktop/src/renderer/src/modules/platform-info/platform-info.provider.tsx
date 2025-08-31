import {type PropsWithChildren} from "react";
import {PlatformInfoContext} from "./platform-info.context";
import {IPlatformInfoService} from "@renderer/modules/platform-info/platform-info.interface";

export interface PlatformInfoProviderProps extends PropsWithChildren {
	platformInfoService: IPlatformInfoService;
}

export function PlatformInfoProvider({children, platformInfoService}: PlatformInfoProviderProps) {
	const value: PlatformInfoContext = {
		platformInfoService,
	}

	return (
		<PlatformInfoContext.Provider value={value}>
			{children}
		</PlatformInfoContext.Provider>
	)
}
