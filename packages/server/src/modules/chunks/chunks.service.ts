import {UserContext} from "@common/request-context.js";
import {DatabaseService} from "@services/database/database.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {EventsService} from "@services/events/events.service.js";
import {CreateChunkDto} from "@modules/chunks/chunks.http.js";


export class ChunksService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly eventsService: EventsService,
		private readonly accessControlService: AccessControlService
	) {}

	async create(userContext: UserContext, createChunkDto: CreateChunkDto): Promise<void> {

	}

	async requestUpload(userContext: UserContext, hash: string): Promise<void> {

	}

	async requestDownload(userContext: UserContext, hash: string): Promise<void> {

	}
}
