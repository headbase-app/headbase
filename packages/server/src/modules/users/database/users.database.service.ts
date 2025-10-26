import postgres, {Row, RowList} from "postgres";

import {ErrorIdentifiers} from "@headbase-app/contracts";

import {
  DatabaseCreateUserDto,
  DatabaseUpdateUserDto,
  DatabaseUserDto,
} from "@modules/users/database/database-user.js";
import {DatabaseService} from "@services/database/database.service.js";
import {PG_UNIQUE_VIOLATION} from "@services/database/database-error-codes.js";
import {ResourceRelationshipError} from "@services/errors/resource/resource-relationship.error.js";
import {SystemError} from "@services/errors/base/system.error.js";
import {ResourceNotFoundError} from "@services/errors/resource/resource-not-found.error.js";


export class UsersDatabaseService {
  constructor(
    private readonly databaseService: DatabaseService
  ) {}

  private static getDatabaseError(e: any) {
    if (e instanceof postgres.PostgresError) {
      if (e.code && e.code === PG_UNIQUE_VIOLATION) {
        if (e.constraint_name == "email_unique") {
          return new ResourceRelationshipError({
            identifier: ErrorIdentifiers.USER_EMAIL_EXISTS,
            applicationMessage: "The supplied email address is already in use."
          })
        }
      }
    }

    return new SystemError({
      message: "Unexpected error while creating user",
      originalError: e
    })
  }

  async get(userId: string): Promise<DatabaseUserDto> {
    const sql = await this.databaseService.getSQL();

    let result: DatabaseUserDto[] = [];
    try {
      result = await sql<DatabaseUserDto[]>`select * from users where id = ${userId}`;
    }
    catch (e: any) {
      throw UsersDatabaseService.getDatabaseError(e);
    }

    if (result.length === 1) {
      return result[0]
    }
    else {
      throw new ResourceNotFoundError({
        identifier: ErrorIdentifiers.USER_NOT_FOUND,
        applicationMessage: "The requested user could not be found."
      })
    }
  }

  async getByEmail(email: string): Promise<DatabaseUserDto> {
    const sql = await this.databaseService.getSQL();

    let result: DatabaseUserDto[] = [];
    try {
      result = await sql<DatabaseUserDto[]>`select * from users where email = ${email}`;
    }
    catch (e: any) {
      throw UsersDatabaseService.getDatabaseError(e);
    }

    if (result.length === 1) {
      return result[0]
    }
    else {
      throw new ResourceNotFoundError({
        identifier: ErrorIdentifiers.USER_NOT_FOUND,
        applicationMessage: "The requested user could not be found."
      })
    }
  }

  async create(user: DatabaseCreateUserDto): Promise<DatabaseUserDto> {
    const sql = await this.databaseService.getSQL();

    let result: DatabaseUserDto[] = [];
    try {
      result = await sql<DatabaseUserDto[]>`insert into users ${sql([user])} returning *;`;
    }
    catch (e: any) {
      throw UsersDatabaseService.getDatabaseError(e);
    }

    if (result.length === 1) {
      return result[0]
    }
    else {
      throw new SystemError({
        message: "Unexpected error returning user after creation",
      })
    }
  }

  async update(userId: string, databaseUpdateUserDto: DatabaseUpdateUserDto): Promise<DatabaseUserDto> {
    const sql = await this.databaseService.getSQL();

    // If there are no supplied fields to update, then just return the existing user.
    if (Object.keys(databaseUpdateUserDto).length === 0) {
      return this.get(userId);
    }

    let result: DatabaseUserDto[] = [];
    try {
      result = await sql<DatabaseUserDto[]>`update users set ${sql(databaseUpdateUserDto)} where id = ${userId} returning *;`;
    }
    catch (e: any) {
      throw UsersDatabaseService.getDatabaseError(e);
    }

    if (result.length === 1) {
      return result[0]
    }
    else {
      throw new SystemError({
        message: "Unexpected error returning user after creation",
      })
    }
  }

  async delete(userId: string): Promise<void> {
    const sql = await this.databaseService.getSQL();

    let result: RowList<Row[]>;
    try {
      result = await sql`delete from users where id = ${userId}`;
    }
    catch (e: any) {
      throw UsersDatabaseService.getDatabaseError(e);
    }

    // If there's a count then rows were affected and the deletion was a success
    // If there's no count but an error wasn't thrown then the entity must not exist
    if (result?.count) {
      return;
    }
    else {
      throw new ResourceNotFoundError({
        applicationMessage: "The requested user could not be found."
      })
    }
  }
}
