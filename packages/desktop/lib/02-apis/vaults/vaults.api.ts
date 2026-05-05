import {Observable} from "rxjs";
import type {LiveQueryResult} from "../../01-common/control-flow.js";
import type {CreateVaultDto, VaultList, UpdateVaultDto, VaultDto} from "./vault.js";

export interface IVaultsAPI {
	// Permission Checks
	checkPermissions: () => Promise<boolean>
	requestPermissions: () => Promise<boolean>
	// Location selection
	isLocationSelectable: () => boolean,
	selectLocation: () => Promise<string|null>
	// Methods
	create: (createVaultDto: CreateVaultDto) => Promise<VaultDto>
	update: (vaultId: string, updateVaultDto: UpdateVaultDto) => Promise<VaultDto>
	delete: (vaultId: string) => Promise<void>
	get: (vaultId: string) => Promise<VaultDto|null>
	liveGet: (vaultId: string) => Observable<LiveQueryResult<VaultDto | null>>
	query: () => Promise<VaultList>
	// Live methods
	liveQuery: () => Observable<LiveQueryResult<VaultList>>
}
