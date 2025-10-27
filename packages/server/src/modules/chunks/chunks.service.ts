import { Injectable } from "@nestjs/common";
import { ObjectStoreService } from "@services/object-store/object-store.service";
import { UserContext } from "@common/request-context";
import { ChunkDto } from "@headbase-app/contracts";
import { AccessControlService } from "@modules/auth/access-control.service";

@Injectable()
export class ChunksService {
	constructor(
		private readonly accessControlService: AccessControlService,
		private readonly objectStoreService: ObjectStoreService,
	) {}

	async create(userContext: UserContext, chunkDto: ChunkDto): Promise<void> {}

	async requestUpload(userContext: UserContext, hash: string): Promise<void> {}

	async requestDownload(userContext: UserContext, hash: string): Promise<void> {}
}
