import type {VaultDto} from "../vaults/vault.js";
import type {Observable} from "rxjs";
import type {LiveQueryResult} from "../../01-common/control-flow.js";

export interface IWorkspaceVaultAPI {
	open: (vaultId: string) => Promise<void>;
	openNewContext: (vaultId: string) => Promise<void>;
	get: () => Promise<VaultDto | null>;
	close: () => Promise<void>;
	liveGet: () => Observable<LiveQueryResult<VaultDto | null>>;
}
