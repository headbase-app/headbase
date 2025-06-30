import {z} from "zod";
import {Roles} from "../auth/permissions";
import {createIdField, createDateField} from "../common/fields";

export const ServerUserDto = z.object({
	id: createIdField(),
	createdAt: createDateField('createdAt'),
	updatedAt: createDateField('updatedAt'),
	email: z.string().email("email must be a valid email address."),
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
export type ServerUserDto = z.infer<typeof ServerUserDto>;

export const UserDto = ServerUserDto.omit({password: true})
export type UserDto = z.infer<typeof UserDto>;

export const CreateUserDto = UserDto
	.omit({verifiedAt: true, firstVerifiedAt: true, role: true})
	.strict()
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = UserDto
	.pick({email: true, displayName: true})
	.partial()
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;
