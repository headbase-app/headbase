import {
  CreateVaultDto,
  UpdateVaultDto,
  VaultsURLParams
} from "@headbase-app/common";
import {NextFunction, Request, Response} from "express";
import {validateSchema} from "@common/schema-validator.js";
import {HttpStatusCodes} from "@common/http-status-codes.js";
import {VaultsService} from "@modules/vaults/vaults.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";


export class VaultsHttpController {
  constructor(
      private vaultsService: VaultsService,
      private accessControlService: AccessControlService
  ) {}

  async createVault(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const createVaultDto = await validateSchema(req.body, CreateVaultDto);

      const result = await this.vaultsService.create(requestUser, createVaultDto);
      return res.status(HttpStatusCodes.CREATED).json(result);
    }
    catch (error) {
      next(error);
    }
  }

  async getVault(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const params = await validateSchema(req.params, VaultsURLParams);

      const result = await this.vaultsService.get(requestUser, params.vaultId);
      return res.status(HttpStatusCodes.OK).json(result);
    }
    catch (error) {
      next(error);
    }
  }

  async updateVault(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const params = await validateSchema(req.params, VaultsURLParams);
      const updateVaultDto = await validateSchema(req.body, UpdateVaultDto);

      const result = await this.vaultsService.update(requestUser, params.vaultId, updateVaultDto);
      return res.status(HttpStatusCodes.OK).json(result);
    }
    catch (error) {
      next(error);
    }
  }

  async deleteVault(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const params = await validateSchema(req.params, VaultsURLParams);

      await this.vaultsService.delete(requestUser, params.vaultId);
      return res.status(HttpStatusCodes.OK).json({statusCode: HttpStatusCodes.OK});
    }
    catch (error) {
      next(error);
    }
  }
}
