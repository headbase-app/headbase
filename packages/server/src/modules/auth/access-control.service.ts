import {AccessForbiddenError} from "@services/errors/access/access-forbidden.error.js";
import {ErrorIdentifiers, Permissions, RolePermissions, Roles} from "@headbase-app/common";
import {ResourceNotFoundError} from "@services/errors/resource/resource-not-found.error.js";
import {UserRequestError} from "@services/errors/base/user-request.error.js";
import {UsersDatabaseService} from "@modules/users/database/users.database.service.js";
import {UserContext} from "@common/request-context.js";
import {Request} from "express"
import {AccessUnauthorizedError} from "@services/errors/access/access-unauthorized.error.js";
import {TokenService} from "@services/token/token.service.js";
import {DatabaseService} from "@services/database/database.service.js";
import {DatabaseUserDto, users} from "@services/database/schema.js";
import {eq} from "drizzle-orm";
import {UsersService} from "@modules/users/users.service.js";

export interface AccessControlOptions {
    /** A list of valid permissions if the requesting user context matches the target user **/
    userScopedPermissions: Permissions[],
    /** A list of valid permissions regardless of requesting user matching target user **/
    unscopedPermissions: Permissions[],

    /** The user context requesting this action **/
    requestingUserContext: UserContext,
    /** The target user id of the given action **/
    targetUserId: string

    /** Allow the requesting user to be unverified **/
    allowUnverifiedRequestingUser?: boolean
    /** Allow target user to be unverified **/
    allowUnverifiedTargetUser?: boolean
}


export class AccessControlService {
    constructor(
        // todo: must depend on DatabaseService not UsersService to prevent circular dependency. Ideally everything should go through the user service?
        private readonly databaseService: DatabaseService,
        private readonly tokenService: TokenService
    ) {}

    /**
     * Get the permissions associated with the given role.
     * This function includes resolving all inherited permissions too.
     *
     * @param role
     */
    static resolveRolePermissions(role: Roles): Permissions[] {
        const permissionProfile = RolePermissions[role]
        let permissions = permissionProfile.permissions

        if (permissionProfile.inherit) {
            permissions = permissions.concat(AccessControlService.resolveRolePermissions(permissionProfile.inherit))
        }

        return permissions
    }

    /**
     * A function that validates the supplied access token against
     * Returns the user context if valid, throws an error if not.
     *
     * @param options
     */
    async validateAccessControlRules(options: AccessControlOptions): Promise<void> {
        // Validate the requesting users verification first, as they shouldn't be able to do anything when unverified even if they have valid permissions.
        if (!options.requestingUserContext.verifiedAt && !options.allowUnverifiedRequestingUser) {
            throw new AccessForbiddenError({
                identifier: ErrorIdentifiers.AUTH_NOT_VERIFIED,
                applicationMessage: "You are unverified and do not have the permissions required to perform this action."
            });
        }

        let hasValidPermission = false;
        for (const userPermission of options.userScopedPermissions) {
            if (
                options.requestingUserContext?.permissions.includes(userPermission) &&
                options.requestingUserContext.id === options.targetUserId
            ) {
                hasValidPermission = true;
                break
            }
        }
        for (const globalPermission of options.unscopedPermissions) {
            if (
                options.requestingUserContext?.permissions.includes(globalPermission)
            ) {
                hasValidPermission = true;
                break
            }
        }

        if (!hasValidPermission) {
            throw new AccessForbiddenError({
                applicationMessage: "You do not have the permissions required to perform this action."
            });
        }

        // Check target user permissions AFTER permission checks.
        // This ensures no target user information (like verification status) will be exposed to users that only have
        // permissions to access their own data.
        if (!options.allowUnverifiedTargetUser && options.requestingUserContext.id !== options.targetUserId) {

            let targetUser
            try {
                const db = this.databaseService.getDatabase()
                let result: DatabaseUserDto[];
                try {
                    result = await db
                      .select()
                      .from(users)
                      .where(eq(users.id, options.targetUserId))
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

                targetUser = UsersService. result[0]
            }
            catch (e) {
                // Rethrow a user not found error as a request error
                if (e instanceof ResourceNotFoundError && e.identifier === ErrorIdentifiers.USER_NOT_FOUND) {
                    throw new UserRequestError({
                        identifier: ErrorIdentifiers.USER_NOT_FOUND,
                        applicationMessage: "You have attempted to perform an action against a user that doesn't exist."
                    })
                }

                throw e
            }

            if (!targetUser.verifiedAt) {
                throw new UserRequestError({
                    identifier: ErrorIdentifiers.AUTH_NOT_VERIFIED,
                    applicationMessage: "You have attempted to perform an action against an unverified user."
                });
            }
        }

        return
    }

    /**
     * An authentication guard which sits at the controller layer.
     * It ensures users are authenticated and adds user context to the request.
     *
     * THIS GUARD DOES NOT HANDLE AUTHORIZATION WHICH IS LOGIC FOR THE SERVICE LAYER.
     */
    async validateAuthentication(req: Request): Promise<UserContext> {
        const authorizationHeader = req.header("authorization");
        if (authorizationHeader) {
            const accessToken = authorizationHeader.split(" ")[1];

            // todo: this is reused in AuthGatewayGuard. Should be a separate function?
            if (accessToken) {
                const tokenPayload = await this.tokenService.validateAndDecodeAccessToken(accessToken);

                if (tokenPayload) {
                    return {
                        id: tokenPayload.sub,
                        sessionId: tokenPayload.sid,
                        verifiedAt: tokenPayload.verifiedAt,
                        permissions: AccessControlService.resolveRolePermissions(tokenPayload.role)
                    }
                }
            }
        }

        throw new AccessUnauthorizedError({
            message: "You are not authorized to perform that action"
        })
    }
}
