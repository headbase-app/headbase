import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {EnvironmentService} from "@services/environment/environment.service.js";

export class ObjectStoreService {
	s3Client: S3Client

	constructor(
		private readonly environmentService: EnvironmentService
	) {
		const ACCOUNT_ENDPOINT = this.environmentService.vars.objectStore.accountEndpoint
		const ACCESS_KEY_ID = this.environmentService.vars.objectStore.accessKeyId
		const SECRET_ACCESS_KEY = this.environmentService.vars.objectStore.secretAccessKey

		this.s3Client = new S3Client({
			region: "eu",
			endpoint: ACCOUNT_ENDPOINT,
			credentials: {
				accessKeyId: ACCESS_KEY_ID,
				secretAccessKey: SECRET_ACCESS_KEY,
			},
		});
	}

	private getChunkObjectKey(vaultId: string, chunkHash: string) {
		return `/v1/${vaultId}/chunks/${chunkHash}`
	}

	getChunkUploadUrl(vaultId: string, chunkHash: string) {
		const BUCKET_NAME = this.environmentService.vars.objectStore.bucketName
		const SIGNED_URL_EXPIRY = this.environmentService.vars.objectStore.uploadExpiry
		const objectKey = this.getChunkObjectKey(vaultId, chunkHash)

		return getSignedUrl(
			this.s3Client,
			new PutObjectCommand({ Bucket: BUCKET_NAME, Key: objectKey }),
			{ expiresIn: SIGNED_URL_EXPIRY },
		)
	}

	getChunkDownloadUrl(vaultId: string, chunkHash: string) {
		const BUCKET_NAME = this.environmentService.vars.objectStore.bucketName
		const SIGNED_URL_EXPIRY = this.environmentService.vars.objectStore.downloadExpiry
		const objectKey = this.getChunkObjectKey(vaultId, chunkHash)

		return getSignedUrl(
			this.s3Client,
			new GetObjectCommand({ Bucket: BUCKET_NAME, Key: objectKey }),
			{ expiresIn: SIGNED_URL_EXPIRY },
		)
	}
}
