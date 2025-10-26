import {z} from "zod";
import isJWT from "validator/lib/isJWT";

export const VerifyEmailDto = z.object({
    token: z.string()
      .refine(isJWT, {message: "token must be a JWT"})
}).strict();

export type VerifyEmailDto = z.infer<typeof VerifyEmailDto>;
