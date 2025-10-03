import {CreateVaultDto, UpdateVaultDto, LocalVaultDto} from "@/contracts/vaults";
import {Subscriber, Subscription} from "@renderer/utils/subscriptions";

export interface IVaultsService {
	createVault: (createVaultDto: CreateVaultDto) => Promise<LocalVaultDto>
	updateVault: (vaultId: string, updateVaultDto: UpdateVaultDto) => Promise<LocalVaultDto>
	deleteVault: (vaultId: string) => Promise<void>
	getVault: (vaultId: string) => Promise<LocalVaultDto|null>;
	getVaults: () => Promise<LocalVaultDto[]>;
	openVault: (vaultId: string) => Promise<void>;
	openVaultNewWindow: (vaultId: string) => Promise<void>;
	getCurrentVault: () => Promise<LocalVaultDto | null>;
	closeCurrentVault: () => Promise<void>;
	liveGetVaults: (subscription: Subscriber<LocalVaultDto[]>) => Subscription;
	liveGetVault: (vaultId: string, subscription: Subscriber<LocalVaultDto | null>) => Subscription;
	liveGetCurrentVault: (subscription: Subscriber<LocalVaultDto | null>) => Subscription;
}
