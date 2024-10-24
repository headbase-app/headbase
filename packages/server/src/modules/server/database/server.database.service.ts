import {DatabaseService} from "@services/database/database.service.js";
import {SystemError} from "@services/errors/base/system.error.js";
import {ServerSettingsDto, UpdateServerSettingsDto} from "@modules/server/server.service.js";


export class ServerManagementDatabaseService {
  constructor(
    private readonly databaseService: DatabaseService
  ) {}

  private static getDatabaseError(e: any) {
    return new SystemError({
      message: "Unexpected error while creating server settings",
      originalError: e
    })
  }

  async getSettings(): Promise<ServerSettingsDto|null> {
    const sql = await this.databaseService.getSQL();

    let result: ServerSettingsDto[] = [];
    try {
      result = await sql<ServerSettingsDto[]>`select * from settings order by created_at limit 1`;
    }
    catch (e: any) {
      throw ServerManagementDatabaseService.getDatabaseError(e);
    }

    if (result.length > 0) {
      return result[0]
    }
    else {
      return null;
    }
  }

  async updateSettings(updateSettingsDto: UpdateServerSettingsDto): Promise<ServerSettingsDto> {
    const sql = await this.databaseService.getSQL();

    let result: ServerSettingsDto[] = [];
    try {
      result = await sql<ServerSettingsDto[]>`insert into settings ${sql([updateSettingsDto])} returning *;`;
    }
    catch (e: any) {
      throw ServerManagementDatabaseService.getDatabaseError(e);
    }

    if (result.length > 0) {
      return result[0];
    }
    else {
      throw new SystemError({
        message: "Unexpected error returning settings after update",
      })
    }
  }
}
