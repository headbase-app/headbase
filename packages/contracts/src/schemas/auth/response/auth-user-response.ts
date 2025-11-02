import {UserDto} from "../../users/users";

export interface AuthUserResponse {
  user: UserDto;
	sessionToken: string
}
