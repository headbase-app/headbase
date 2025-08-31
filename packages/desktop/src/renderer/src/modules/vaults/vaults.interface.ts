import {Vault, VaultMap} from "../../../../contracts/vaults";

export interface IVaultsService {
	getVault: (vaultId: string) => Promise<Vault|null>;
	getVaults: () => Promise<VaultMap>;
	getCurrentVault: () => Promise<Vault | null>;
	openVault: (vaultId: string) => Promise<void>;
	openVaultNewWindow: (vaultId: string) => Promise<void>;
}
