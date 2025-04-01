import {VaultsURLParams} from "@headbase-app/common";
import {NextFunction, Request, Response} from "express";
import {validateSchema} from "@common/schema-validator.js";
import {SnapshotService} from "@modules/snapshot/snapshot.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {HttpStatusCodes} from "@common/http-status-codes.js";


export class SnapshotHttpAdapter {
  constructor(
    private snapshotService: SnapshotService,
    private accessControlService: AccessControlService,
  ) {}

  async getSnapshot(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const params = await validateSchema(req.params, VaultsURLParams);
      const snapshot = await this.snapshotService.getSnapshot(requestUser, params.vaultId);
      res.status(HttpStatusCodes.OK).json(snapshot);
    }
    catch (error) {
      next(error);
    }
  }
}
