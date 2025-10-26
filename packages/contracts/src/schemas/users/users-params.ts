import {z} from "zod";
import {ResourceListingParams} from "../common/listings";

export const UsersURLParams = z.object({
  userId: z.string().uuid("userId must be a uuid"),
}).strict();
export type UsersURLParams = z.infer<typeof UsersURLParams>;

export const UserParams = ResourceListingParams
export type UserParams = z.infer<typeof UserParams>
