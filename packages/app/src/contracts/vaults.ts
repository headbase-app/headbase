import {z} from "zod";

export const LocalVaultDto = z.object({
	id: z.uuid(),
	displayName: z.string().min(1),
	path: z.string(), // todo: validate as path?
	password: z.string().min(1),
})
export type LocalVaultDto = z.infer<typeof LocalVaultDto>

export const CreateVaultDto = LocalVaultDto.pick({displayName: true, path: true, password: true})
export type CreateVaultDto = z.infer<typeof CreateVaultDto>

export const UpdateVaultDto = LocalVaultDto.pick({displayName: true, path: true, password: true})
export type UpdateVaultDto = z.infer<typeof UpdateVaultDto>
