import {z} from "zod"

export const DatabaseDto = z.object({
	id: z.string()
		.min(1, "id must be supplied"),
	displayName: z.string()
		.min(1, "displayName must be between 1 and 100 characters")
		.max(100, "displayName must be between 1 and 100 characters"),
	path: z.string()
		.min(1, "path must be supplied")
}).strict()
export type DatabaseDto = z.infer<typeof DatabaseDto>;

export const CreateDatabaseDto = DatabaseDto
export type CreateDatabaseDto = z.infer<typeof CreateDatabaseDto>

export const UpdateDatabaseDto = DatabaseDto
	.pick({displayName: true, path: true})
	.partial()
export type UpdateDatabaseDto = z.infer<typeof UpdateDatabaseDto>

export const DatabaseListDto = z.array(DatabaseDto)
export type DatabaseListDto = z.infer<typeof DatabaseListDto>
