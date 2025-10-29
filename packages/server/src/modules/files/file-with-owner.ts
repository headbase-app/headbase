import { z } from "zod";

import { UserDto, FileDto } from "@headbase-app/contracts";

export const FileWithOwnerDto = FileDto.extend({
	ownerId: UserDto.shape.id,
}).strict();
export type FileWithOwnerDto = z.infer<typeof FileWithOwnerDto>;
