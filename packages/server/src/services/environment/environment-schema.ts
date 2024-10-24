import {z} from "zod";

/**
 * The schema of the env variable object for the application.
 * This is exposed via the EnvironmentService instance attribute ".vars".
 */
export const EnvironmentSchema = z.object({
  general: z.object({
    applicationName: z.string(),
    port: z.number(),
    environment: z.string(),
    allowedOrigins: z.array(z.string().url())
  }),
  database: z.object({
    url: z.string()
  }),
  dataStore: z.object({
    redisUrl: z.string()
  }),
  auth: z.object({
    issuer: z.string().optional(),
    audience: z.string().optional(),
    accessToken: z.object({
      secret: z.string(),
      expiry: z.string()
    }),
    refreshToken: z.object({
      secret: z.string(),
      expiry: z.string()
    }),
    emailVerification: z.object({
      secret: z.string(),
      url: z.string().url(),
      expiry: z.string()
    }),
    passwordReset: z.object({
      secret: z.string(),
      url: z.string().url(),
      expiry: z.string()
    })
  }),
  email: z.object({
    sendMode: z.union([
        z.literal("mailgun"), z.literal("log"), z.literal("silent")
    ]),
    mailgun: z.object({
      domain: z.string(),
      apiKey: z.string(),
      sender: z.object({
        name: z.string(),
        address: z.string()
      }),
      isEu: z.boolean().optional(),
    })
  }),
  items: z.object({
    defaultPageLimit: z.number().int(),
    maxPageLimit: z.number().int(),
  }),
  versions: z.object({
    defaultPageLimit: z.number().int(),
    maxPageLimit: z.number().int(),
  }),
});

export type EnvironmentSchema = z.infer<typeof EnvironmentSchema>;
