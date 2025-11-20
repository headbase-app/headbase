import type {LiveQuerySubscriber, LiveQuerySubscription} from "@contracts/query";
import type {LocalVaultDto} from "@api/vaults/local-vault.ts";

export interface ICurrentVaultService {
	open: (vaultId: string) => Promise<void>;
	openNewContext: (vaultId: string) => Promise<void>;
	get: () => Promise<LocalVaultDto | null>;
	close: () => Promise<void>;
	liveGet: (subscriber: LiveQuerySubscriber<LocalVaultDto | null>) => LiveQuerySubscription;
}
