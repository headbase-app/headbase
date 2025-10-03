import {LocalVaultDto} from "@/contracts/vaults";
import {LiveQuerySubscriber, LiveQuerySubscription} from "@contracts/query";

export interface ICurrentVaultAPI {
	open: (vaultId: string) => Promise<void>;
	openNewWindow: (vaultId: string) => Promise<void>;
	get: () => Promise<LocalVaultDto | null>;
	close: () => Promise<void>;
	liveGet: (subscriber: LiveQuerySubscriber<LocalVaultDto | null>) => LiveQuerySubscription;
}
