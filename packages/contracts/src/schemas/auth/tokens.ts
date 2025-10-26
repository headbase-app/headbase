import {z} from "zod";
import {Roles} from "./permissions";
import {createDateField} from "../common/fields";

export const GenericTokenPayload = z.object({
  iss: z.string(),
  aud: z.string(),
  sub: z.string(),
  exp: z.number(),
}).strict()
export type GenericTokenPayload = z.infer<typeof AuthTokenPayload>;

export const AuthTokenPayload = GenericTokenPayload.extend({
  sid: z.string(),
  cid: z.number(),
}).strict()
export type AuthTokenPayload = z.infer<typeof AuthTokenPayload>;

export const AccessTokenPayload = AuthTokenPayload.extend({
  type: z.literal("accessToken"),
  verifiedAt: createDateField('verifiedAt').nullable(),
  role: Roles
})
export type AccessTokenPayload = z.infer<typeof AccessTokenPayload>;

export const RefreshTokenPayload = AuthTokenPayload.extend({
  type: z.literal("refreshToken"),
})
export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayload>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const ActionTokenType = z.enum([ "verify-email", "change-email", "reset-password"]);
export type ActionTokenType = z.infer<typeof ActionTokenType>;

export const ActionTokenOptions = z.object({
  userId: z.string(),
  actionType: ActionTokenType,
  secret: z.string(),
  expiry: z.string()
})
export type ActionTokenOptions = z.infer<typeof ActionTokenOptions>

export const ActionTokenPayload = GenericTokenPayload.extend({
  type: ActionTokenType,
}).strict()
export type ActionTokenPayload = z.infer<typeof AuthTokenPayload>;