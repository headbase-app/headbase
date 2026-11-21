import type {DatabaseDto} from "../database-manager/database.ts";
import type {Observable} from "rxjs";
import type {LiveQueryResult} from "../../01-common/control-flow.js";

export interface IDatabaseSwitcherAPI {
	open: (databaseId: string) => Promise<void>;
	openNewContext: (databaseId: string) => Promise<void>;
	get: () => Promise<DatabaseDto | null>;
	close: () => Promise<void>;
	liveGet: () => Observable<LiveQueryResult<DatabaseDto | null>>;
}
