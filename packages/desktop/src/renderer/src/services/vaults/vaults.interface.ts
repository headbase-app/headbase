import {CreateVaultDto, UpdateVaultDto, Vault} from "../../../../contracts/vaults";
import {Subscriber, Subscription} from "@renderer/utils/subscriptions";

export interface IVaultsService {
	createVault: (createVaultDto: CreateVaultDto) => Promise<Vault>
	updateVault: (vaultId: string, updateVaultDto: UpdateVaultDto) => Promise<Vault>
	deleteVault: (vaultId: string) => Promise<void>
	getVault: (vaultId: string) => Promise<Vault|null>;
	getVaults: () => Promise<Vault[]>;
	openVault: (vaultId: string) => Promise<void>;
	openVaultNewWindow: (vaultId: string) => Promise<void>;
	getCurrentVault: () => Promise<Vault | null>;
	liveGetCurrentVault: (subscription: Subscriber<Vault | null>) => Subscription;
}
