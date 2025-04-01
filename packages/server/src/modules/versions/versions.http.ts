import {NextFunction, Request, Response} from "express";

import {
  VersionDto,
  VersionsURLParams,
  VersionsQueryParams,
} from "@headbase-app/common";

import {validateSchema} from "@common/schema-validator.js";
import {HttpStatusCodes} from "@common/http-status-codes.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {VersionsService} from "@modules/versions/versions.service.js";


export class VersionsHttpController {
  constructor(
      private readonly versionsService: VersionsService,
      private readonly accessControlService: AccessControlService,
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const versionDto = await validateSchema(req.body, VersionDto);

      const createdVersionDto = await this.versionsService.create(requestUser, versionDto);
      res.status(HttpStatusCodes.CREATED).json(createdVersionDto);
    }
    catch (error) {
      next(error)
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const params = await validateSchema(req.params, VersionsURLParams);

      const versionDto = await this.versionsService.get(requestUser, params.itemId);
      res.status(HttpStatusCodes.OK).json(versionDto)
    }
    catch (error) {
      next(error)
    }
  }

  async query(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const query = await validateSchema(req.query, VersionsQueryParams);

      if ("ids" in query) {
        const items = await this.versionsService.getFromIds(requestUser, query.ids);
        res.status(HttpStatusCodes.OK).json(items)
      }
      else {
        const result = await this.versionsService.query(requestUser, query)
        res.status(HttpStatusCodes.OK).json(result)
      }
    }
    catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const params = await validateSchema(req.params, VersionsURLParams);
      const requestUser = await this.accessControlService.validateAuthentication(req);

      await this.versionsService.delete(requestUser, params.itemId);
      res.status(HttpStatusCodes.OK).json({statusCode: HttpStatusCodes.OK});
    }
    catch (error) {
      next(error)
    }
  }
}
