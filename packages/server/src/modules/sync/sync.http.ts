import {NextFunction, Request, Response} from "express";
import {HttpStatusCodes} from "@common/http-status-codes.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {SyncService} from "@modules/sync/sync.service.js";

export class SyncHttpController {
  constructor(
      private readonly accessControlService: AccessControlService,
      private readonly syncService:  SyncService
  ) {}

  async getConnectionTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req)
      const connectionTicket = await this.syncService.requestTicket(requestUser)
      return res.status(HttpStatusCodes.OK).json({ticket: connectionTicket});
    }
    catch (error) {
      next(error);
    }
  }
}
