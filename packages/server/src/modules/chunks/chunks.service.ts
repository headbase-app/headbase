import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { ObjectStoreService } from "@services/object-store/object-store.service.js";
import { UserContext } from "@common/request-context.js";
import { VaultsService } from "@modules/vaults/vaults.service.js";
import { UserRequestError } from "@services/errors/base/user-request.error.js";
import { ResourceNotFoundError } from "@services/errors/resource/resource-not-found.error.js";
import type { WrapperType } from "@common/wrapper-type.js";

@Injectable()
export class ChunksService {
	constructor(
		private readonly objectStoreService: ObjectStoreService,
		@Inject(forwardRef(() => VaultsService))
		private readonly vaultsService: WrapperType<VaultsService>,
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

	async getAllVaultChunks(vaultId: string) {
		const vaultPrefix = `v1/vaults/${vaultId}/`;
		const objectKeys = await this.objectStoreService.query(vaultPrefix);

		return (
			objectKeys
				// Only return chunk hash, vault prefix/location is implementation detail of storage.
				.map((key) => key.replace(vaultPrefix, ""))
				// Remove parent/prefix file to leave only hashes.
				// todo: could this be filtered out in .query?
				.filter(Boolean)
		);
	}

	async isUploaded(vaultId: string, hash: string) {
		const objectKey = this.getChunkObjectKey(vaultId, hash);
		return this.objectStoreService.isUploaded(objectKey);
	}
}
