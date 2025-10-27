import { Injectable } from "@nestjs/common";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@services/config/config.service";

@Injectable()
export class ObjectStoreService {
	s3Client: S3Client;

	constructor(private readonly configService: ConfigService) {
		const ACCOUNT_ENDPOINT = this.configService.vars.objectStore.accountEndpoint;
		const ACCESS_KEY_ID = this.configService.vars.objectStore.accessKeyId;
		const SECRET_ACCESS_KEY = this.configService.vars.objectStore.secretAccessKey;

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
		return `/v1/${vaultId}/chunks/${chunkHash}`;
	}

	getChunkUploadUrl(vaultId: string, chunkHash: string) {
		const BUCKET_NAME = this.configService.vars.objectStore.bucketName;
		const SIGNED_URL_EXPIRY = this.configService.vars.objectStore.uploadExpiry;
		const objectKey = this.getChunkObjectKey(vaultId, chunkHash);

		return getSignedUrl(this.s3Client, new PutObjectCommand({ Bucket: BUCKET_NAME, Key: objectKey }), { expiresIn: SIGNED_URL_EXPIRY });
	}

	getChunkDownloadUrl(vaultId: string, chunkHash: string) {
		const BUCKET_NAME = this.configService.vars.objectStore.bucketName;
		const SIGNED_URL_EXPIRY = this.configService.vars.objectStore.downloadExpiry;
		const objectKey = this.getChunkObjectKey(vaultId, chunkHash);

		return getSignedUrl(this.s3Client, new GetObjectCommand({ Bucket: BUCKET_NAME, Key: objectKey }), { expiresIn: SIGNED_URL_EXPIRY });
	}
}
