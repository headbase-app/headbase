import {createContext, useContext} from "react";
import {IVaultsService} from "@renderer/services/vaults/vaults.interface";

export interface VaultsContext {
	vaultsService: IVaultsService
}

// no default is provided, instantiation is dependent on using the provider and injection
export const VaultsContext = createContext<VaultsContext>({} as VaultsContext)

export const useVaultsService = () => useContext(VaultsContext)
