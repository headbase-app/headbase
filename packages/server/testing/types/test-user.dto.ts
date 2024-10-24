import {UserEntity} from "@headbase-app/common";

export interface TestUserEntity extends UserEntity {
  passwordHash: string,
}
