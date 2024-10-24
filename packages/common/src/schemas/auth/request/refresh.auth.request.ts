import {z} from "zod";
import isJWT from "validator/lib/isJWT";

export const RefreshRequest = z.object({
    refreshToken: z.string()
      .refine(isJWT, {message: "refreshToken must be a JWT"})
}).strict();

export type RefreshRequest = z.infer<typeof RefreshRequest>;
