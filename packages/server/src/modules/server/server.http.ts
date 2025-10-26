import {NextFunction, Request, Response} from "express";
import {HttpStatusCodes} from "@common/http-status-codes.js";
import {ServerInfoDto} from "@headbase-app/contracts";
import {ServerManagementService, UpdateServerSettingsDto} from "@modules/server/server.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {validateSchema} from "@common/schema-validator.js";


export class ServerManagementHttpController {
  constructor(
      private readonly accessControlService: AccessControlService,
      private readonly serverManagementService: ServerManagementService
  ) {}

  async requestHealthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.serverManagementService.runHealthCheck()
      res.status(HttpStatusCodes.OK).json(result);
    }
    catch (e) {
      next(e)
    }
  }

  async getInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await this.serverManagementService._UNSAFE_getSettings()

      const meta: ServerInfoDto = {
        version: "v1",
        registrationEnabled: settings.registrationEnabled,
        limits: {
					// todo: review if/how to implement these size limits.
          usersMaxVaults: 10,
					vaultMaxSize: 10000,
          fileMaxSize: 2000,
        }
      }

      res.status(HttpStatusCodes.OK).json(meta);
    }
    catch (error) {
      next(error);
    }
  }

  async getSettings(req: Request, res: Response, next: NextFunction) {
    const requestUser = await this.accessControlService.validateAuthentication(req);

    try {
      const settings = await this.serverManagementService.getSettings(requestUser)
      res.status(HttpStatusCodes.OK).json(settings);
    }
    catch (e) {
      next(e)
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    const requestUser = await this.accessControlService.validateAuthentication(req);
    const updateSettingsDto = await validateSchema(req.body, UpdateServerSettingsDto);

    try {
      const settings = await this.serverManagementService.updateSettings(requestUser, updateSettingsDto)
      res.status(HttpStatusCodes.OK).json(settings);
    }
    catch (e) {
      next(e)
    }
  }
}
