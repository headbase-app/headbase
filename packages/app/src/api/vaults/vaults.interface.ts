import {CreateVaultDto, UpdateVaultDto, LocalVaultDto} from "@contracts/vaults";
import type {LiveQuerySubscriber, LiveQuerySubscription} from "@contracts/query";

export interface IVaultsAPI {
	create: (createVaultDto: CreateVaultDto) => Promise<LocalVaultDto>
	update: (vaultId: string, updateVaultDto: UpdateVaultDto) => Promise<LocalVaultDto>
	delete: (vaultId: string) => Promise<void>
	get: (vaultId: string) => Promise<LocalVaultDto|null>;
	query: () => Promise<LocalVaultDto[]>;
	liveGet: (vaultId: string, subscriber: LiveQuerySubscriber<LocalVaultDto | null>) => LiveQuerySubscription;
	liveQuery: (subscriber: LiveQuerySubscriber<LocalVaultDto[]>) => LiveQuerySubscription;
}
