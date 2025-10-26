import {CreateUserDto, ErrorIdentifiers, UpdateUserDto, UserDto} from "@headbase-app/contracts";
import {UserContext} from "@common/request-context.js";
import {AccessForbiddenError} from "@services/errors/access/access-forbidden.error.js";
import {PasswordService} from "@services/password/password.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {EventsService} from "@services/events/events.service.js";
import {EventIdentifiers} from "@services/events/events.js";
import {ServerManagementService} from "@modules/server/server.service.js";
import {DatabaseService} from "@services/database/database.service.js";
import {DatabaseUserDto, users} from "@services/database/schema.js";
import {eq, getTableColumns} from "drizzle-orm";
import {ResourceNotFoundError} from "@services/errors/resource/resource-not-found.error.js";
import postgres from "postgres";
import {PG_UNIQUE_VIOLATION} from "@services/database/database-error-codes.js";
import {ResourceRelationshipError} from "@services/errors/resource/resource-relationship.error.js";
import {SystemError} from "@services/errors/base/system.error.js";
import {isoFormat} from "@services/database/iso-format-date.js";

export class UsersService {
    constructor(
       private readonly databaseService: DatabaseService,
       private readonly accessControlService: AccessControlService,
       private readonly eventsService: EventsService,
       private readonly serverManagementService: ServerManagementService,
    ) {}

    static getContextualError(e: any) {
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

    static convertDatabaseItemToDto(userWithPassword: DatabaseUserDto): UserDto {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userDto } = userWithPassword;
        return userDto;
    }

    async get(userContext: UserContext, userId: string): Promise<UserDto> {
        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["users:retrieve"],
            unscopedPermissions: ["users:retrieve:all"],
            requestingUserContext: userContext,
            targetUserId: userId
        })

        const result = await this._UNSAFE_getById(userId)
        return UsersService.convertDatabaseItemToDto(result);
    }

    async _UNSAFE_getByEmail(email: string): Promise<DatabaseUserDto> {
        const db = this.databaseService.getDatabase()

        let result: DatabaseUserDto[];
        try {
            result = await db
              .select({
                  ...getTableColumns(users),
                  createdAt: isoFormat(users.createdAt),
                  updatedAt: isoFormat(users.updatedAt),
                  verifiedAt: isoFormat(users.verifiedAt),
                  firstVerifiedAt: isoFormat(users.firstVerifiedAt),
              })
              .from(users)
              .where(eq(users.email, email))
        }
        catch (e) {
            throw UsersService.getContextualError(e)
        }
        if (!result[0]) {
            throw new ResourceNotFoundError({
                identifier: ErrorIdentifiers.USER_NOT_FOUND,
                applicationMessage: "The requested user could not be found."
            })
        }

        return result[0]
    }

    async _UNSAFE_getById(id: string): Promise<DatabaseUserDto> {
        const db = this.databaseService.getDatabase()

        let result: DatabaseUserDto[];
        try {
            result = await db
              .select({
                  ...getTableColumns(users),
                  createdAt: isoFormat(users.createdAt),
                  updatedAt: isoFormat(users.updatedAt),
                  verifiedAt: isoFormat(users.verifiedAt),
                  firstVerifiedAt: isoFormat(users.firstVerifiedAt),
              })
              .from(users)
              .where(eq(users.id, id))
        }
        catch (e) {
            throw UsersService.getContextualError(e)
        }
        if (!result[0]) {
            throw new ResourceNotFoundError({
                identifier: ErrorIdentifiers.USER_NOT_FOUND,
                applicationMessage: "The requested user could not be found."
            })
        }

        return result[0]
    }

    async create(createUserDto: CreateUserDto): Promise<UserDto> {
        // todo: add additional permission based access control? an anonymous role and user context would need adding

        const settings = await this.serverManagementService._UNSAFE_getSettings()
        if (!settings.registrationEnabled) {
            throw new AccessForbiddenError({
                identifier: ErrorIdentifiers.USER_REGISTRATION_DISABLED,
                applicationMessage: "User registration is currently disabled."
            })
        }

        const passwordHash = await PasswordService.hashPassword(createUserDto.password);

        const db = this.databaseService.getDatabase()
        let result: DatabaseUserDto[]
        try {
            result = await db
              .insert(users)
              .values({
                  email: createUserDto.email,
                  displayName: createUserDto.displayName,
                  passwordHash,
              })
              .returning() as unknown as DatabaseUserDto[]
        }
        catch (e) {
            throw UsersService.getContextualError(e);
        }
        if (!result[0]) {
            throw new SystemError({
                identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED,
                message: "Returning user after creation failed"
            })
        }

        const userDto = UsersService.convertDatabaseItemToDto(result[0]);
        await this.eventsService.dispatch({
            type: EventIdentifiers.USER_CREATE,
            detail: {
                user: userDto
            }
        })
        return userDto;
    }

    async update(userContext: UserContext, userId: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["users:update"],
            unscopedPermissions: ["users:update:all"],
            requestingUserContext: userContext,
            targetUserId: userId
        })

        const db = this.databaseService.getDatabase()
        let result: DatabaseUserDto[];
        try {
            result = await db
              .update(users)
              .set(updateUserDto)
              .where(eq(users.id, userId))
              .returning({
                  ...getTableColumns(users),
                  createdAt: isoFormat(users.createdAt),
                  updatedAt: isoFormat(users.updatedAt),
                  verifiedAt: isoFormat(users.verifiedAt),
                  firstVerifiedAt: isoFormat(users.firstVerifiedAt),
              })
        }
        catch (e) {
            throw UsersService.getContextualError(e)
        }
        if (!result[0]) {
            throw new SystemError({identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED, message: "Returning user after update failed"});
        }

        const userDto = UsersService.convertDatabaseItemToDto(result[0]);

        await this.eventsService.dispatch({
            type: EventIdentifiers.USER_UPDATE,
            detail: {
                sessionId: userContext.sessionId,
                user: userDto
            }
        })

        return userDto
    }

    async delete(userContext: UserContext, userId: string): Promise<void> {
        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["users:delete"],
            unscopedPermissions: ["users:delete:all"],
            requestingUserContext: userContext,
            targetUserId: userId
        })

        const db = this.databaseService.getDatabase()
        await db
          .delete(users)
          .where(eq(users.id, userId))

        await this.eventsService.dispatch({
            type: EventIdentifiers.USER_DELETE,
            detail: {
                sessionId: userContext.sessionId,
                userId: userId
            }
        })
    }

    // todo: add access control checks?
    async verifyUser(userId: string): Promise<UserDto> {
        const timestamp = new Date().toISOString();
        const currentUser = await this._UNSAFE_getById(userId)

        const db = this.databaseService.getDatabase()
        let result: DatabaseUserDto[];
        try {
            result = await db
              .update(users)
              .set({
                  verifiedAt: timestamp,
                  firstVerifiedAt: currentUser.firstVerifiedAt ? undefined : timestamp
              })
              .where(eq(users.id, userId))
              .returning({
                  ...getTableColumns(users),
                  createdAt: isoFormat(users.createdAt),
                  updatedAt: isoFormat(users.updatedAt),
                  verifiedAt: isoFormat(users.verifiedAt),
                  firstVerifiedAt: isoFormat(users.firstVerifiedAt),
              })
        }
        catch (e) {
            throw UsersService.getContextualError(e)
        }
        if (!result[0]) {
            throw new SystemError({identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED, message: "Returning user after update failed"});
        }

        return UsersService.convertDatabaseItemToDto(result[0]);
    }
}
