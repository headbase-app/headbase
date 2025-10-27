import { UserDto } from "@headbase-app/contracts";

export interface TestUserEntity extends UserDto {
	password: string;
	passwordHash: string;
}
