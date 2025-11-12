import type {LiveQuerySubscriber, LiveQuerySubscription} from "@contracts/query";
import type {CreateVaultDto, LocalVaultDto, UpdateVaultDto} from "@api/vaults/local-vault.ts";

export interface IVaultsService {
	create: (createVaultDto: CreateVaultDto) => Promise<LocalVaultDto>
	update: (vaultId: string, updateVaultDto: UpdateVaultDto) => Promise<LocalVaultDto>
	delete: (vaultId: string) => Promise<void>
	get: (vaultId: string) => Promise<LocalVaultDto|null>;
	query: () => Promise<LocalVaultDto[]>;
	liveGet: (vaultId: string, subscriber: LiveQuerySubscriber<LocalVaultDto | null>) => LiveQuerySubscription;
	liveQuery: (subscriber: LiveQuerySubscriber<LocalVaultDto[]>) => LiveQuerySubscription;
}
