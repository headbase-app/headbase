import {DatabaseService} from "@services/database/database.service.js";
import {
  CreateVaultDto,
  ErrorIdentifiers,
  UpdateVaultDto,
  VaultDto
} from "@headbase-app/common";
import Postgres from "postgres";
import {PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION} from "@services/database/database-error-codes.js";
import {ResourceRelationshipError} from "@services/errors/resource/resource-relationship.error.js";
import {SystemError} from "@services/errors/base/system.error.js";
import {ResourceNotFoundError} from "@services/errors/resource/resource-not-found.error.js";
import {EnvironmentService} from "@services/environment/environment.service.js";


export class VaultsDatabaseService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly environmentService: EnvironmentService
  ) {}

  private static getDatabaseError(e: any) {
    if (e instanceof Postgres.PostgresError && e.code) {
      if (e.code === PG_FOREIGN_KEY_VIOLATION) {
        if (e.constraint_name === "vault_owner") {
          return new ResourceRelationshipError({
            identifier: ErrorIdentifiers.USER_NOT_FOUND,
            applicationMessage: "Attempted to add a vault with owner that doesn't exist."
          })
        }
      }
      if (e.code === PG_UNIQUE_VIOLATION) {
        if (e.constraint_name === "vault_name_unique") {
          return new ResourceRelationshipError({
            identifier: ErrorIdentifiers.VAULT_NAME_EXISTS,
            applicationMessage: "Vault owner already has vault with the given name."
          })
        }
        else if (e.constraint_name === "vaults_pk") {
          return new ResourceRelationshipError({
            identifier: ErrorIdentifiers.RESOURCE_NOT_UNIQUE,
            applicationMessage: "Vault with given id already exists."
          })
        }
      }
    }

    return new SystemError({
      message: "Unexpected error while executing vault query",
      originalError: e
    })
  }

  async get(vaultId: string): Promise<VaultDto> {
    const sql = await this.databaseService.getSQL();

    let result: VaultDto[] = [];
    try {
      result = await sql<VaultDto[]>`select * from vaults where id = ${vaultId}`;
    }
    catch (e: any) {
      throw VaultsDatabaseService.getDatabaseError(e);
    }

    if (result.length === 1) {
      return result[0]
    }
    else {
      throw new ResourceNotFoundError({
        identifier: ErrorIdentifiers.VAULT_NOT_FOUND,
        applicationMessage: "The requested vault could not be found."
      })
    }
  }

  async create(createVaultDto: CreateVaultDto): Promise<VaultDto> {
    const sql = await this.databaseService.getSQL();

    let result: VaultDto[] = [];
    try {
      result = await sql<VaultDto[]>`insert into vaults ${sql([createVaultDto])} returning *;`;
    }
    catch (e: any) {
      throw VaultsDatabaseService.getDatabaseError(e);
    }

    if (result.length === 1) {
      return result[0]
    }
    else {
      throw new SystemError({
        message: "Unexpected error returning vault after creation",
      })
    }
  }

  async update(id: string, updateVaultDto: UpdateVaultDto): Promise<VaultDto> {
    const sql = await this.databaseService.getSQL();

    // If there are no supplied fields to update, then just return the existing user.
    if (Object.keys(updateVaultDto).length === 0) {
      return this.get(id);
    }

    let result: VaultDto[] = [];
    try {
      result = await sql<VaultDto[]>`update vaults set ${sql(updateVaultDto)} where id = ${id} returning *;`;
    }
    catch (e: any) {
      throw VaultsDatabaseService.getDatabaseError(e);
    }

    if (result.length === 1) {
      return result[0]
    }
    else {
      throw new SystemError({
        message: "Unexpected error returning vault after update",
      })
    }
  }

  async delete(id: string): Promise<void> {
    const sql = await this.databaseService.getSQL();

    let result: Postgres.RowList<Postgres.Row[]>;
    try {
      result = await sql`delete from vaults where id = ${id}`;
    }
    catch (e: any) {
      throw VaultsDatabaseService.getDatabaseError(e);
    }

    // If there's a count then rows were affected and the deletion was a success
    // If there's no count but an error wasn't thrown then the entity must not exist
    if (result?.count) {
      return;
    }
    else {
      throw new ResourceNotFoundError({
        identifier: ErrorIdentifiers.VAULT_NOT_FOUND,
        applicationMessage: "The requested vault could not be found."
      })
    }
  }
}
