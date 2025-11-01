import { z } from "zod";

/**
 * The schema of the env variable object for the application.
 */
export const ConfigSchema = z.object({
	general: z.object({
		applicationName: z.string(),
		port: z.number(),
		allowedOrigins: z.array(z.string().url()),
		logLevel: z.union([z.literal("debug"), z.literal("minimal")]),
	}),
	database: z.object({
		url: z.string(),
	}),
	auth: z.object({
		issuer: z.string().optional(),
		audience: z.string().optional(),
		accessToken: z.object({
			secret: z.string(),
			expiry: z.string(),
		}),
		refreshToken: z.object({
			secret: z.string(),
			expiry: z.string(),
		}),
		emailVerification: z.object({
			secret: z.string(),
			url: z.string().url(),
			expiry: z.string(),
		}),
		passwordReset: z.object({
			secret: z.string(),
			url: z.string().url(),
			expiry: z.string(),
		}),
	}),
	email: z.object({
		sendMode: z.union([z.literal("smtp"), z.literal("log"), z.literal("silent")]),
		sender: z.object({
			name: z.string(),
			address: z.string(),
		}),
		smtp: z.object({
			host: z.string(),
			port: z.number().int(),
			username: z.string(),
			password: z.string(),
		}),
	}),
	objectStore: z.object({
		accountEndpoint: z.string(),
		accessKeyId: z.string(),
		secretAccessKey: z.string(),
		bucketName: z.string(),
		uploadExpiry: z.number().int(),
		downloadExpiry: z.number().int(),
	}),
});
export type ConfigSchema = z.infer<typeof ConfigSchema>;
