import type {VaultDto} from "../vault.ts";
import type {Observable} from "rxjs";
import type {LiveQueryResult} from "../control-flow.ts";

export interface IWorkspaceVaultAPI {
	open: (vaultId: string) => Promise<void>;
	openNewContext: (vaultId: string) => Promise<void>;
	get: () => Promise<VaultDto | null>;
	close: () => Promise<void>;
	liveGet: () => Observable<LiveQueryResult<VaultDto | null>>;
}
