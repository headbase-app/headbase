import {CreateVaultDto, UpdateVaultDto, Vault, VaultMap} from "../../../../contracts/vaults";

export interface IVaultsService {
	createVault: (createVaultDto: CreateVaultDto) => Promise<Vault>
	updateVault: (vaultId: string, updateVaultDto: UpdateVaultDto) => Promise<Vault>
	deleteVault: (vaultId: string) => Promise<void>
	getVault: (vaultId: string) => Promise<Vault|null>;
	getVaults: () => Promise<VaultMap>;
	openVault: (vaultId: string) => Promise<void>;
	openVaultNewWindow: (vaultId: string) => Promise<void>;
	getCurrentVault: () => Promise<Vault | null>;
}
