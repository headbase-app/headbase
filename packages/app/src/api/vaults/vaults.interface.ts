import type {LiveQueryResult} from "@api/control-flow.ts";
import type {CreateVaultDto, LocalVaultDto, UpdateVaultDto} from "@api/vaults/local-vault.ts";
import {Observable} from "rxjs";

export interface IVaultsService {
	create: (createVaultDto: CreateVaultDto) => Promise<LocalVaultDto>
	update: (vaultId: string, updateVaultDto: UpdateVaultDto) => Promise<LocalVaultDto>
	delete: (vaultId: string) => Promise<void>
	changePassword: (vaultId: string, oldPassword: string, newPassword: string) => Promise<LocalVaultDto>
	get: (vaultId: string) => Promise<LocalVaultDto|null>;
	query: () => Promise<LocalVaultDto[]>;
	liveGet: (vaultId: string) => Observable<LiveQueryResult<LocalVaultDto | null>>;
	liveQuery: () => Observable<LiveQueryResult<LocalVaultDto[]>>;
}
