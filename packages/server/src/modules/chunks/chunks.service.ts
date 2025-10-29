import { Injectable } from "@nestjs/common";

import { ObjectStoreService } from "@services/object-store/object-store.service";
import { UserContext } from "@common/request-context";
import { VaultsService } from "@modules/vaults/vaults.service";
import { UserRequestError } from "@services/errors/base/user-request.error";
import { ResourceNotFoundError } from "@services/errors/resource/resource-not-found.error";

@Injectable()
export class ChunksService {
	constructor(
		private readonly objectStoreService: ObjectStoreService,
		private readonly vaultsService: VaultsService,
	) {}

	private getChunkObjectKey(vaultId: string, hash: string) {
		return `v1/vaults/${vaultId}/${hash}`;
	}

	async requestUpload(userContext: UserContext, vaultId: string, hash: string) {
		// Using vault service to run access control checks
		await this.vaultsService.get(userContext, vaultId);

		const objectKey = this.getChunkObjectKey(vaultId, hash);
		const isUploaded = await this.objectStoreService.isUploaded(objectKey);
		if (isUploaded) {
			// todo: add specific error identifier?
			throw new UserRequestError({
				userMessage: "The requested object has already been uploaded.",
			});
		}

		return this.objectStoreService.getSignedUploadUrl(objectKey);
	}

	async requestDownload(userContext: UserContext, vaultId: string, hash: string) {
		// Using vault service to run access control checks
		await this.vaultsService.get(userContext, vaultId);

		const objectKey = this.getChunkObjectKey(vaultId, hash);
		const isUploaded = await this.objectStoreService.isUploaded(objectKey);
		if (!isUploaded) {
			// todo: add specific error identifier?
			throw new ResourceNotFoundError({
				userMessage: "The requested object does not exist.",
			});
		}

		return this.objectStoreService.getSignedDownloadUrl(this.getChunkObjectKey(vaultId, hash));
	}
}
