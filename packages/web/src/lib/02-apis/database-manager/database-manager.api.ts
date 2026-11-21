import {Observable} from "rxjs";
import type {LiveQueryResult} from "../../01-common/control-flow.js";
import type {CreateDatabaseDto, DatabaseListDto, UpdateDatabaseDto, DatabaseDto} from "./database.ts";

export interface IDatabaseManagerAPI {
	// Location selection
	isLocationSelectable: () => boolean,
	selectLocation: () => Promise<string|null>
	// Methods
	create: (createDatabaseDto: CreateDatabaseDto) => Promise<DatabaseDto>
	update: (id: string, updateDatabaseDto: UpdateDatabaseDto) => Promise<DatabaseDto>
	delete: (id: string) => Promise<void>
	get: (id: string) => Promise<DatabaseDto|null>
	liveGet: (id: string) => Observable<LiveQueryResult<DatabaseDto | null>>
	query: () => Promise<DatabaseListDto>
	liveQuery: () => Observable<LiveQueryResult<DatabaseListDto>>
}
