import {z} from "zod";

export const GenericTokenPayload = z.object({
  iss: z.string(),
  aud: z.string(),
  sub: z.string(),
  exp: z.number(),
}).strict()
export type GenericTokenPayload = z.infer<typeof GenericTokenPayload>;

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
export type ActionTokenPayload = z.infer<typeof ActionTokenPayload>;
