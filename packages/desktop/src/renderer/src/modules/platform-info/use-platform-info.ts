import {useContext} from "react";
import {PlatformInfoContext} from "./platform-info.context";

export const usePlatformInfo = () => useContext(PlatformInfoContext)
