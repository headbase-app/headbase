import {z} from "zod";

import {CreateUserDto, Roles, UpdateUserDto, UserDto, createDateField} from "@headbase-app/contracts";

// todo: Should this exported from @headbase-app/contracts as generic UserDtoWithPassword?
// if not, is there a better way than reusing the CreateUserDto just to get that field?
export const DatabaseUserDto = UserDto.extend({
	passwordHash: z.string()
}).strict()
export type DatabaseUserDto = z.infer<typeof DatabaseUserDto>

export const DatabaseCreateUserDto = CreateUserDto
	//.omit({password: true})
	.extend({
		passwordHash: z.string(),
		role: Roles
	})
	.strict()
export type DatabaseCreateUserDto = z.infer<typeof DatabaseCreateUserDto>

export const DatabaseUpdateUserDto = UpdateUserDto
	.extend({
		passwordHash: z.string(),
		verifiedAt: createDateField("verifiedAt").nullable(),
		firstVerifiedAt: createDateField("firstVerifiedAt").nullable(),
	})
	.strict()
	.partial()
export type DatabaseUpdateUserDto = z.infer<typeof DatabaseUpdateUserDto>
