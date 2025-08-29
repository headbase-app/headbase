import {useContext} from "react";
import {VaultsContext} from "./vaults.context";

export const useVaults = () => useContext(VaultsContext)
