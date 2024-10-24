import {TokenPair} from "../tokens";
import {UserDto} from "../../users/users";

export interface AuthUserResponse {
  tokens: TokenPair;
  user: UserDto;
}