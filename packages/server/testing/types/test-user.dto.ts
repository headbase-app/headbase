import {UserDto} from "@headbase-app/contracts";

export interface TestUserEntity extends UserDto {
  passwordHash: string,
}
