import * as dotenv from "dotenv";
import { ConfigSchema } from "./config-schema";
import { Injectable } from "@nestjs/common";

dotenv.config({ quiet: true });

/**
 * A service containing configuration for use across the application.
 *
 * Although configuration is basically just a plain object its wrapped in this class to allow it
 * to be used in the NestJS DI system.
 * The config uses a zod schema, so it will throw an error if the config doesn't follow the schema.
 */
@Injectable()
export class ConfigService {
	readonly vars: ConfigSchema = ConfigSchema.parse({
		general: {
			applicationName: process.env.APPLICATION_NAME,
			port: parseInt(process.env.PORT as string),
			allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [],
			logLevel: process.env.LOG_LEVEL ?? "minimal",
		},
		database: {
			url: process.env.DATABASE_URL,
		},
		auth: {
			issuer: process.env.AUTH_ISSUER ?? null,
			audience: process.env.AUTH_AUDIENCE ?? null,
			accessToken: {
				secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
				expiry: "15 mins",
			},
			refreshToken: {
				secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
				expiry: "14 days",
			},
			emailVerification: {
				secret: process.env.AUTH_EMAIL_VERIFICATION_SECRET,
				url: process.env.AUTH_EMAIL_VERIFICATION_URL,
				expiry: "15 mins",
			},
			passwordReset: {
				secret: process.env.AUTH_PASSWORD_RESET_SECRET,
				url: process.env.AUTH_PASSWORD_RESET_URL,
				expiry: "15 mins",
			},
		},
		email: {
			sendMode: process.env.EMAIL_SEND_MODE ?? "smtp",
			sender: {
				name: process.env.EMAIL_SENDER_NAME,
				address: process.env.EMAIL_SENDER_ADDRESS,
			},
			smtp: {
				host: process.env.EMAIL_SMTP_HOST,
				port: parseInt(process.env.EMAIL_SMTP_PORT as string),
				username: process.env.EMAIL_SMTP_USERNAME,
				password: process.env.EMAIL_SMTP_PASSWORD,
			},
		},
		objectStore: {
			accountEndpoint: process.env.OBJECT_STORE_ACCOUNT_ENDPOINT,
			accessKeyId: process.env.OBJECT_STORE_ACCESS_KEY_ID,
			secretAccessKey: process.env.OBJECT_STORE_SECRET_ACCESS_KEY,
			bucketName: process.env.OBJECT_STORE_BUCKET_NAME,
			uploadExpiry: parseInt(process.env.OBJECT_STORE_UPLOAD_EXPIRY as string),
			downloadExpiry: parseInt(process.env.OBJECT_STORE_DOWNLOAD_EXPIRY as string),
		},
	});
}
