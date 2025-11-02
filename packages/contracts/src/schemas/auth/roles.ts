import {z} from "zod"

/**
 * Roles are used to define what a user have access to.
 */
export const Roles = z.enum([
	"user",
	"admin"
]);
export type Roles = z.infer<typeof Roles>
