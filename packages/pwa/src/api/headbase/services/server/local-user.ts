import {UserDto} from "@headbase-app/contracts";
import * as z from "zod";

export const LocalUserDto = UserDto.extend({
	serverUrl: z.string().url("must be a valid URL")
})
export type LocalUserDto = z.infer<typeof LocalUserDto>
