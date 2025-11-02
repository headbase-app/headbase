import {z} from "zod";
import {Roles} from "../auth/roles";
import {createIdField, createDateField} from "../common/fields";

export const UserDto = z.object({
	id: createIdField(),
	email: z.string().email("email must be a valid email address."),
	displayName: z.string()
		.min(1, "displayName must be at least 1 character.")
		.max(50, "displayName can't be over 50 characters."),
	createdAt: createDateField('createdAt'),
	updatedAt: createDateField('updatedAt'),
	verifiedAt: createDateField('verifiedAt').nullable(),
	firstVerifiedAt: createDateField('firstVerifiedAt').nullable(),
	role: Roles,
}).strict()
export type UserDto = z.infer<typeof UserDto>;

export const CreateUserDto = UserDto
	.pick({email: true, displayName: true})
	.extend({
		password: z.string()
			.min(12, "password must be at least 12 characters.")
			.max(100, "password can't be over 100 characters."),
	})
	.strict()
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = UserDto
	.pick({email: true, displayName: true})
	.partial()
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;
