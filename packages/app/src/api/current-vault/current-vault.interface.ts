import type {LocalVaultDto} from "@api/vaults/local-vault.ts";
import type {Observable} from "rxjs";
import type {LiveQueryResult} from "@api/control-flow.ts";

export interface ICurrentVaultService {
	open: (vaultId: string) => Promise<void>;
	openNewContext: (vaultId: string) => Promise<void>;
	get: () => Promise<LocalVaultDto | null>;
	close: () => Promise<void>;
	liveGet: () => Observable<LiveQueryResult<LocalVaultDto | null>>;
}
