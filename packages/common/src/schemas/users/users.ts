import {z} from "zod";
import {Roles} from "../auth/permissions";
import {createIdField, createDateField} from "../common/fields";

export const UserFields = z.object({
	email: z.string().email("email must be... an email."),
	displayName: z.string()
		.min(1, "displayName must be at least 1 character.")
		.max(50, "displayName can't be over 50 characters."),
	password: z.string()
		.min(12, "password must be at least 12 characters.")
		.max(100, "password can't be over 100 characters."),
	verifiedAt: createDateField('verifiedAt').nullable(),
	firstVerifiedAt: createDateField('firstVerifiedAt').nullable(),
	role: Roles,
}).strict()
export type UserFields = z.infer<typeof UserFields>;

export const UserEntity = UserFields.extend({
	id: createIdField(),
	createdAt: createDateField('createdAt'),
	updatedAt: createDateField('updatedAt')
}).strict()
export type UserEntity = z.infer<typeof UserEntity>;

export const UserDto = UserEntity
	.omit({password: true})
	.strict()
export type UserDto = z.infer<typeof UserDto>;

export const CreateUserDto = UserFields
	.omit({verifiedAt: true, firstVerifiedAt: true, role: true})
	.strict()
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = UserFields
	.pick({email: true, displayName: true})
	.partial()
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;
