import { forwardRef, Inject, Injectable } from "@nestjs/common";
import postgres from "postgres";
import { DrizzleQueryError, eq, getTableColumns } from "drizzle-orm";

import { CreateUserDto, ErrorIdentifiers, UpdateUserDto, UserDto } from "@headbase-app/contracts";
import { UserContext } from "@common/request-context";
import { AccessForbiddenError } from "@services/errors/access/access-forbidden.error";
import { PasswordService } from "@services/password/password.service";
import { EventsService } from "@services/events/events.service";
import { EventIdentifiers } from "@services/events/events";
import { ServerManagementService } from "@modules/server/server.service";
import { DatabaseService } from "@services/database/database.service";
import { users } from "@services/database/schema/schema";
import { ResourceNotFoundError } from "@services/errors/resource/resource-not-found.error";
import { PG_UNIQUE_VIOLATION } from "@services/database/database-error-codes";
import { ResourceRelationshipError } from "@services/errors/resource/resource-relationship.error";
import { SystemError } from "@services/errors/base/system.error";
import { isoFormat } from "@services/database/schema/iso-format-date";
import { DatabaseUserDto } from "@modules/users/database-user";
import { AuthService } from "@modules/auth/auth.service";

@Injectable()
export class UsersService {
	constructor(
		private readonly databaseService: DatabaseService,
		@Inject(forwardRef(() => AuthService))
		private readonly authService: AuthService,
		private readonly eventsService: EventsService,
		@Inject(forwardRef(() => ServerManagementService))
		private readonly serverManagementService: ServerManagementService,
	) {}

	static getContextualError(e: any) {
		if (e instanceof DrizzleQueryError && e.cause instanceof postgres.PostgresError) {
			if (e.cause.code && e.cause.code === PG_UNIQUE_VIOLATION) {
				if (e.cause.constraint_name == "email_unique") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.USER_EMAIL_EXISTS,
						userMessage: "The supplied email address is already in use.",
					});
				}
			}
		}

		return new SystemError({
			message: "Unexpected error while creating user",
			cause: e,
		});
	}

	static convertDatabaseItemToDto(userWithPassword: DatabaseUserDto): UserDto {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { passwordHash, ...userDto } = userWithPassword;
		return userDto;
	}

	async get(userContext: UserContext, userId: string): Promise<UserDto> {
		await this.authService.guardOwnership({
			userContext,
			ownerId: userId,
			allowAdminBypass: true,
		});

		const result = await this._UNSAFE_getById(userId);
		return UsersService.convertDatabaseItemToDto(result);
	}

	async _UNSAFE_getByEmail(email: string): Promise<DatabaseUserDto> {
		const db = this.databaseService.getDatabase();

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
				.where(eq(users.email, email));
		} catch (e) {
			throw UsersService.getContextualError(e);
		}
		if (!result[0]) {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.USER_NOT_FOUND,
				userMessage: "The requested user could not be found.",
			});
		}

		return result[0];
	}

	async _UNSAFE_getById(id: string): Promise<DatabaseUserDto> {
		const db = this.databaseService.getDatabase();

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
				.where(eq(users.id, id));
		} catch (e) {
			throw UsersService.getContextualError(e);
		}
		if (!result[0]) {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.USER_NOT_FOUND,
				userMessage: "The requested user could not be found.",
			});
		}

		return result[0];
	}

	async create(createUserDto: CreateUserDto): Promise<UserDto> {
		// todo: add additional permission based access control? an anonymous role and user context would need adding

		const settings = await this.serverManagementService._UNSAFE_getSettings();
		if (!settings.registrationEnabled) {
			throw new AccessForbiddenError({
				identifier: ErrorIdentifiers.USER_REGISTRATION_DISABLED,
				userMessage: "User registration is currently disabled.",
			});
		}

		const passwordHash = await PasswordService.hashPassword(createUserDto.password);

		const db = this.databaseService.getDatabase();
		let result: DatabaseUserDto[];
		try {
			result = (await db
				.insert(users)
				.values({
					email: createUserDto.email,
					displayName: createUserDto.displayName,
					passwordHash,
				})
				.returning()) as unknown as DatabaseUserDto[];
		} catch (e) {
			throw UsersService.getContextualError(e);
		}
		if (!result[0]) {
			throw new SystemError({
				identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED,
				message: "Returning user after creation failed",
			});
		}

		const userDto = UsersService.convertDatabaseItemToDto(result[0]);
		this.eventsService.dispatch({
			type: EventIdentifiers.USER_CREATE,
			detail: {
				user: userDto,
			},
		});
		return userDto;
	}

	async update(userContext: UserContext, userId: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
		await this.authService.guardOwnership({
			userContext,
			ownerId: userId,
			allowAdminBypass: true,
		});

		const db = this.databaseService.getDatabase();
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
				});
		} catch (e) {
			throw UsersService.getContextualError(e);
		}
		if (!result[0]) {
			throw new SystemError({ identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED, message: "Returning user after update failed" });
		}

		const userDto = UsersService.convertDatabaseItemToDto(result[0]);

		this.eventsService.dispatch({
			type: EventIdentifiers.USER_UPDATE,
			detail: {
				sessionId: userContext.sessionId,
				user: userDto,
			},
		});

		return userDto;
	}

	async delete(userContext: UserContext, userId: string): Promise<void> {
		await this.authService.guardOwnership({
			userContext,
			ownerId: userId,
			allowAdminBypass: true,
		});

		const db = this.databaseService.getDatabase();
		await db.delete(users).where(eq(users.id, userId));

		this.eventsService.dispatch({
			type: EventIdentifiers.USER_DELETE,
			detail: {
				sessionId: userContext.sessionId,
				userId: userId,
			},
		});
	}

	// todo: add access control checks?
	async verifyUser(userId: string): Promise<UserDto> {
		const timestamp = new Date().toISOString();
		const currentUser = await this._UNSAFE_getById(userId);

		const db = this.databaseService.getDatabase();
		let result: DatabaseUserDto[];
		try {
			result = await db
				.update(users)
				.set({
					verifiedAt: timestamp,
					firstVerifiedAt: currentUser.firstVerifiedAt ? undefined : timestamp,
				})
				.where(eq(users.id, userId))
				.returning({
					...getTableColumns(users),
					createdAt: isoFormat(users.createdAt),
					updatedAt: isoFormat(users.updatedAt),
					verifiedAt: isoFormat(users.verifiedAt),
					firstVerifiedAt: isoFormat(users.firstVerifiedAt),
				});
		} catch (e) {
			throw UsersService.getContextualError(e);
		}
		if (!result[0]) {
			throw new SystemError({ identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED, message: "Returning user after update failed" });
		}

		return UsersService.convertDatabaseItemToDto(result[0]);
	}
}
