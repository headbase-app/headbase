import { Injectable } from "@nestjs/common";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, PutObjectCommand, S3Client, HeadObjectCommandInput, HeadObjectCommand, paginateListObjectsV2, S3ServiceException } from "@aws-sdk/client-s3";
import { ConfigService } from "@services/config/config.service";
import { SystemError } from "@services/errors/base/system.error";
import { ErrorIdentifiers } from "@headbase-app/contracts";

@Injectable()
export class ObjectStoreService {
	s3Client: S3Client;

	constructor(private readonly configService: ConfigService) {
		const ACCOUNT_ENDPOINT = this.configService.vars.objectStore.accountEndpoint;
		const ACCESS_KEY_ID = this.configService.vars.objectStore.accessKeyId;
		const SECRET_ACCESS_KEY = this.configService.vars.objectStore.secretAccessKey;

		this.s3Client = new S3Client({
			region: "auto",
			endpoint: ACCOUNT_ENDPOINT,
			credentials: {
				accessKeyId: ACCESS_KEY_ID,
				secretAccessKey: SECRET_ACCESS_KEY,
			},
		});
	}

	/**
	 * Check if an object with the given key has been uploaded.
	 *
	 * @param objectKey
	 */
	async isUploaded(objectKey: string): Promise<boolean> {
		const BUCKET_NAME = this.configService.vars.objectStore.bucketName;

		try {
			const bucketParams: HeadObjectCommandInput = {
				Bucket: BUCKET_NAME,
				Key: objectKey,
			};
			const headCmd = new HeadObjectCommand(bucketParams);
			const result = await this.s3Client.send(headCmd);

			return result.$metadata.httpStatusCode === 200;
		} catch (error) {
			if (error instanceof S3ServiceException) {
				// Doesn't exist and permission policy includes s3:ListBucket
				if (error.$metadata?.httpStatusCode === 404) {
					return false;
				}
				// Doesn't exist and permission policy WITHOUT s3:ListBucket
				else if (error.$metadata?.httpStatusCode === 403) {
					return false;
				}
			}

			throw new SystemError({
				identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED,
				message: `Unexpected error from object store while querying for object ${objectKey}`,
				cause: error,
			});
		}
	}

	/**
	 * Return a presigned URL allowing for object upload.
	 *
	 * todo: restrict upload via checksum and max size limits?
	 *
	 * @param objectKey
	 */
	async getSignedUploadUrl(objectKey: string) {
		const BUCKET_NAME = this.configService.vars.objectStore.bucketName;
		const UPLOAD_EXPIRY = this.configService.vars.objectStore.uploadExpiry;
		return getSignedUrl(this.s3Client, new PutObjectCommand({ Bucket: BUCKET_NAME, Key: objectKey }), { expiresIn: UPLOAD_EXPIRY });
	}

	/**
	 * Return a presigned URL allowing for object download.
	 *
	 * @param objectKey
	 */
	async getSignedDownloadUrl(objectKey: string) {
		const BUCKET_NAME = this.configService.vars.objectStore.bucketName;
		const DOWNLOAD_EXPIRY = this.configService.vars.objectStore.downloadExpiry;
		return getSignedUrl(this.s3Client, new GetObjectCommand({ Bucket: BUCKET_NAME, Key: objectKey }), { expiresIn: DOWNLOAD_EXPIRY });
	}

	/**
	 * Query for objects, with optional prefix.
	 *
	 * @param prefix
	 */
	async query(prefix?: string) {
		const BUCKET_NAME = this.configService.vars.objectStore.bucketName;

		try {
			const objectKeys: string[] = [];
			const paginator = paginateListObjectsV2(
				{
					client: this.s3Client,
					// pageSize: 1000,
				},
				{
					Bucket: BUCKET_NAME,
					Prefix: prefix,
				},
			);

			// todo: types of .Contents and .Key include undefined, does this need special handling?
			// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html doesn't handle undefined either
			for await (const page of paginator) {
				for (const object of page.Contents!) {
					objectKeys.push(object.Key!);
				}
			}

			return objectKeys;
		} catch (error) {
			if (error instanceof S3ServiceException) {
				throw new SystemError({
					identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED,
					message: `Unexpected error from object store while querying for objects, prefix "${prefix}"`,
					cause: error,
				});
			}

			throw new SystemError({
				identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED,
				message: `Unexpected error from application while querying for objects, prefix "${prefix}"`,
				cause: error,
			});
		}
	}
}
