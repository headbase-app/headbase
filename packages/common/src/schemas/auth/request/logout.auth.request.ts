import {z} from "zod";
import isJWT from "validator/lib/isJWT";

export const LogoutRequest = z.object({
    refreshToken: z.string()
      .refine(isJWT, {message: "refreshToken must be a JWT"})
}).strict();

export type LogoutRequest = z.infer<typeof LogoutRequest>;
