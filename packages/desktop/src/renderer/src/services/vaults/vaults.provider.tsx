import {type PropsWithChildren} from "react";
import {VaultsContext} from "./vaults.context";
import {IVaultsService} from "./vaults.interface";

export interface VaultsProviderProps extends PropsWithChildren {
	vaultsService: IVaultsService;
}

export function VaultsProvider({children, vaultsService}: VaultsProviderProps) {
	const value: VaultsContext = {
		vaultsService
	}

	return (
		<VaultsContext.Provider value={value}>
			{children}
		</VaultsContext.Provider>
	)
}
