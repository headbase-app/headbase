import {createContext} from "react";
import {Version} from "../../../../contracts/version";

export interface PlatformInfoContext {
	versions: Version[]
	isVersionsLoading: boolean
}

export const DEFAULT_PLATFORM_INFO_CONTEXT: PlatformInfoContext = {
	versions: [],
	isVersionsLoading: true,
}

export const PlatformInfoContext = createContext<PlatformInfoContext>(DEFAULT_PLATFORM_INFO_CONTEXT)
