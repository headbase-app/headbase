import {NextFunction, Request, Response} from "express"

import {LoginRequest, LogoutRequest, RefreshRequest, VerifyEmailDto} from "@headbase-app/common";

import { validateSchema } from "@common/schema-validator.js";
import {HttpStatusCodes} from "@common/http-status-codes.js";
import {AuthService} from "@modules/auth/auth.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";


export class AuthHttpController {
  constructor(
      private readonly authService: AuthService,
      private readonly accessControlService: AccessControlService
  ) {}

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await validateSchema(req.body, LoginRequest);
      const response = await this.authService.login(data.email, data.password);
      return res.status(HttpStatusCodes.OK).json(response);
    }
    catch (error) {
      next(error)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await validateSchema(req.body, LogoutRequest);
      await this.authService.logout(data.refreshToken);
      return res.status(HttpStatusCodes.OK).json({statusCode: HttpStatusCodes.OK});
    }
    catch (error) {
      next(error)
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await validateSchema(req.body, RefreshRequest);
      const response = await this.authService.refresh(data.refreshToken);
      return res.status(HttpStatusCodes.OK).json(response);
    }
    catch (error) {
      next(error)
    }
  }

  async check(req: Request, res: Response, next: NextFunction) {
    try {
      await this.accessControlService.validateAuthentication(req);
      return res.status(HttpStatusCodes.OK).send({statusCode: HttpStatusCodes.OK});
    }
    catch(error) {
      next(error)
    }
  }

  /**
   * An endpoint where users can request email verification emails.
   * Will always succeed regardless of if the email address supplied was valid and/or an email was actually sent
   *
   * @param req
   * @param res
   * @param next
   */
  async requestEmailVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      await this.authService.requestEmailVerification(requestUser.id)
      return res.status(HttpStatusCodes.OK).json({statusCode: HttpStatusCodes.OK});
    }
    catch (error) {
      next(error)
    }
  }

  /**
   * An endpoint where users can verify their account
   *
   * @param req
   * @param res
   * @param next
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const data = await validateSchema(req.body, VerifyEmailDto);
      const response = await this.authService.verifyEmail(requestUser, data.token)
      return res.status(HttpStatusCodes.OK).send(response)
    }
    catch (error) {
      next(error)
    }
  }

  async requestEmailChange(req: Request, res: Response, next: NextFunction) {
    try {
      await this.accessControlService.validateAuthentication(req);

      // todo: implement /v1/auth/change-email [GET]
      return res.status(HttpStatusCodes.NOT_IMPLEMENTED).send({
        statusCode: HttpStatusCodes.NOT_IMPLEMENTED,
        message: "Email changing has not been implemented yet"
      });
    }
    catch (error) {
      next(error)
    }
  }

  async changeEmail(req: Request, res: Response, next: NextFunction) {
    try {
      await this.accessControlService.validateAuthentication(req);

      // todo: implement /v1/auth/change-email [POST]
      return res.status(HttpStatusCodes.NOT_IMPLEMENTED).send({
        statusCode: HttpStatusCodes.NOT_IMPLEMENTED,
        message: "Email changing has not been implemented yet"
      });
    }
    catch (error) {
      next(error)
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      await this.accessControlService.validateAuthentication(req);

      // todo: implement /v1/auth/password-reset [GET]
      return res.status(HttpStatusCodes.NOT_IMPLEMENTED).send({
        statusCode: HttpStatusCodes.NOT_IMPLEMENTED,
        message: "Password reset has not been implemented yet"
      });
    }
    catch (error) {
      next(error)
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await this.accessControlService.validateAuthentication(req);

      // todo: implement /v1/auth/password-reset [POST]
      return res.status(HttpStatusCodes.NOT_IMPLEMENTED).send({
        statusCode: HttpStatusCodes.NOT_IMPLEMENTED,
        message: "Password reset has not been implemented yet"
      });
    }
    catch (error) {
      next(error)
    }
  }
}
