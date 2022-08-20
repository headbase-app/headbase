import {AccessForbiddenError, Injectable} from "@kangojs/core";
import {TemplatesDatabaseService} from "./database/templates.database.service";
import {
  CreateTemplateRequest, DefaultVaultsListOptions,
  GetTemplateResponse, GetTemplatesResponse, ListOptions,
  TemplateDto,
  TemplatesQueryParams,
  UpdateTemplateRequest
} from "@ben-ryder/athena-js-lib";
import {VaultsService} from "../vaults/vaults.service";


@Injectable({
  identifier: "templates-service"
})
export class TemplatesService {
  constructor(
    private templatesDatabaseService: TemplatesDatabaseService,
    private vaultsService: VaultsService
  ) {}

  async checkAccess(requestUserId: string, templateId: string): Promise<void> {
    const template = await this.templatesDatabaseService.getWithOwner(templateId);

    if (template.owner === requestUserId) {
      return;
    }

    throw new AccessForbiddenError({
      message: "Access forbidden to template"
    })
  }

  async get(templateId: string): Promise<GetTemplateResponse> {
    return await this.templatesDatabaseService.get(templateId);
  }

  async getWithAccessCheck(requestUserId: string, templateId: string): Promise<GetTemplateResponse> {
    await this.checkAccess(requestUserId, templateId);
    return this.get(templateId);
  }

  async add(userId: string, vaultId: string, createTemplateDto: CreateTemplateRequest): Promise<TemplateDto> {
    await this.vaultsService.checkAccess(userId, vaultId);
    return await this.templatesDatabaseService.create(vaultId, createTemplateDto);
  }

  async update(templateId: string, templateUpdate: UpdateTemplateRequest): Promise<TemplateDto> {
    return await this.templatesDatabaseService.update(templateId, templateUpdate)
  }

  async updateWithAccessCheck(requestUserId: string, templateId: string, templateUpdate: UpdateTemplateRequest): Promise<TemplateDto> {
    await this.checkAccess(requestUserId, templateId);
    return this.update(templateId, templateUpdate);
  }

  async delete(templateId: string): Promise<void> {
    return this.templatesDatabaseService.delete(templateId);
  }

  async deleteWithAccessCheck(requestUserId: string, templateId: string): Promise<void> {
    await this.checkAccess(requestUserId, templateId);
    return this.delete(templateId);
  }

  async listWithAccessCheck(ownerId: string, templateId: string, options: TemplatesQueryParams): Promise<GetTemplatesResponse> {
    const processedOptions: ListOptions = {
      skip: options.skip || DefaultVaultsListOptions.skip,
      take: options.take || DefaultVaultsListOptions.take,
      orderBy: options.orderBy || DefaultVaultsListOptions.orderBy,
      orderDirection: options.orderDirection || DefaultVaultsListOptions.orderDirection
    };

    const templates = await this.templatesDatabaseService.list(ownerId, processedOptions);
    const meta = await this.templatesDatabaseService.getListMetadata(ownerId, processedOptions);

    return {
      templates,
      meta
    }
  }
}