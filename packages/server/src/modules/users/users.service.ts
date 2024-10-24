import {UsersDatabaseService} from "@modules/users/database/users.database.service.js";
import {CreateUserDto, ErrorIdentifiers, UpdateUserDto, UserDto} from "@headbase-app/common";
import {UserContext} from "@common/request-context.js";
import {DatabaseCreateUserDto, DatabaseUpdateUserDto, DatabaseUserDto} from "@modules/users/database/database-user.js";
import {AccessForbiddenError} from "@services/errors/access/access-forbidden.error.js";
import {PasswordService} from "@services/password/password.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {EventsService} from "@services/events/events.service.js";
import {EventIdentifiers} from "@services/events/events.js";
import {ServerManagementService} from "@modules/server/server.service.js";


export class UsersService {
    constructor(
       private readonly usersDatabaseService: UsersDatabaseService,
       private readonly accessControlService: AccessControlService,
       private readonly eventsService: EventsService,
       private readonly serverManagementService: ServerManagementService,
    ) {}

    convertDatabaseDto(userWithPassword: DatabaseUserDto): UserDto {
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

        const databaseUserDto = await this.usersDatabaseService.get(userId);
        return this.convertDatabaseDto(databaseUserDto);
    }

    async _UNSAFE_getByEmail(email: string) {
        return this.usersDatabaseService.getByEmail(email);
    }

    async _UNSAFE_getById(id: string) {
        return this.usersDatabaseService.get(id);
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
        const databaseCreateUserDto: DatabaseCreateUserDto = {
            displayName: createUserDto.displayName,
            email: createUserDto.email,
            passwordHash,
            role: "user",
        }

        const databaseUser = await this.usersDatabaseService.create(databaseCreateUserDto);
        const userDto = this.convertDatabaseDto(databaseUser);
        await this.eventsService.dispatch({
            type: EventIdentifiers.USER_CREATE,
            detail: {
                user: userDto
            }
        })

        return this.convertDatabaseDto(databaseUser);
    }

    async update(userContext: UserContext, userId: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["users:update"],
            unscopedPermissions: ["users:update:all"],
            requestingUserContext: userContext,
            targetUserId: userId
        })

        const databaseUpdateDto: DatabaseUpdateUserDto = {}
        if (updateUserDto.displayName) {
            databaseUpdateDto.displayName = updateUserDto.displayName;
        }
        // todo: don't allow email and password updates? Require this to go via verification email?
        if (updateUserDto.email) {
            databaseUpdateDto.email = updateUserDto.email;
            databaseUpdateDto.verifiedAt = null;
        }

        const updatedUser = await this.usersDatabaseService.update(userId, databaseUpdateDto);
        const updatedUserDto = this.convertDatabaseDto(updatedUser);
        await this.eventsService.dispatch({
            type: EventIdentifiers.USER_UPDATE,
            detail: {
                sessionId: userContext.sessionId,
                user: updatedUser
            }
        })

        return updatedUserDto
    }

    async delete(userContext: UserContext, userId: string): Promise<void> {
        await this.accessControlService.validateAccessControlRules({
            userScopedPermissions: ["users:delete"],
            unscopedPermissions: ["users:delete:all"],
            requestingUserContext: userContext,
            targetUserId: userId
        })

        await this.usersDatabaseService.delete(userId);
        await this.eventsService.dispatch({
            type: EventIdentifiers.USER_DELETE,
            detail: {
                sessionId: userContext.sessionId,
                userId: userId
            }
        })
    }

    async verifyUser(userDto: UserDto): Promise<UserDto> {
        const timestamp = new Date().toISOString();

        let updatedUser: DatabaseUserDto
        if (userDto.firstVerifiedAt) {
            updatedUser = await this.usersDatabaseService.update(userDto.id, {verifiedAt: timestamp })
        }
        else {
            updatedUser = await this.usersDatabaseService.update(userDto.id, {verifiedAt: timestamp, firstVerifiedAt: timestamp })
        }

        return this.convertDatabaseDto(updatedUser)
    }
}
