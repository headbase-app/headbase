import {createContext} from "react";
import {Vault, VaultMap} from "../../../../contracts/vaults";

export interface VaultsContext {
	vaults: VaultMap;
	isVaultsLoading: boolean

	currentVault: Vault | null;
	isCurrentVaultLoading: boolean;

	openVault: (vaultId: string) => Promise<void>;
	openVaultNewWindow: (vaultId: string) => Promise<void>;
}

export const DEFAULT_VAULTS_CONTEXT: VaultsContext = {
	vaults: {},
	isVaultsLoading: true,
	currentVault: null,
	isCurrentVaultLoading: true,
	openVault: async () => {},
	openVaultNewWindow: async () => {},
}

export const VaultsContext = createContext<VaultsContext>(DEFAULT_VAULTS_CONTEXT)
