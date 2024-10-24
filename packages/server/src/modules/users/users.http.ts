import {CreateUserDto, UpdateUserDto, UsersURLParams} from "@headbase-app/common";
import {NextFunction, Request, Response} from "express";
import {validateSchema} from "@common/schema-validator.js";
import {HttpStatusCodes} from "@common/http-status-codes.js";
import {UsersService} from "@modules/users/users.service.js";
import {TokenService} from "@services/token/token.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";


export class UsersHttpController {
  constructor(
      private usersService: UsersService,
      private tokenService: TokenService,
      private accessControlService: AccessControlService,
  ) {}

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const createUserDto = await validateSchema(req.body, CreateUserDto);

      // Access control and registration enabled checks are done within the service.
      const newUser = await this.usersService.create(createUserDto);
      const createdTokenPair = await this.tokenService.createNewTokenPair(newUser);

      return res.status(HttpStatusCodes.CREATED).json({
        user: newUser,
        tokens: createdTokenPair.tokens
      });
    }
    catch (error) {
      next(error)
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const params = await validateSchema(req.params, UsersURLParams);

      const user = await this.usersService.get(requestUser, params.userId);
      return res.status(HttpStatusCodes.OK).json(user)
    }
    catch (error) {
      next(error)
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const params = await validateSchema(req.params, UsersURLParams);
      const updateUserDto = await validateSchema(req.body, UpdateUserDto);

      const result = await this.usersService.update(requestUser, params.userId, updateUserDto);
      return res.status(HttpStatusCodes.OK).json(result)
    }
    catch (error) {
      next(error)
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const params = await validateSchema(req.params, UsersURLParams);

      await this.usersService.delete(requestUser, params.userId);
      return res.status(HttpStatusCodes.OK).json({statusCode: HttpStatusCodes.OK});
    }
    catch (error) {
      next(error)
    }
  }
}
