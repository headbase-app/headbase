import { Injectable } from "@nestjs/common";
import ms from "ms";
import { eq, getTableColumns, lte } from "drizzle-orm";
import { randomBytes, randomUUID } from "node:crypto";

import { AuthUserResponse, ErrorIdentifiers, Roles, UserDto } from "@headbase-app/contracts";

import { TokenService } from "@services/token/token.service";
import { EmailService } from "@services/email/email.service";
import { DatabaseUserDto } from "@modules/users/database-user";
import { AccessForbiddenError } from "@services/errors/access/access-forbidden.error";
import { PasswordService } from "@services/password/password.service";
import { UserRequestError } from "@services/errors/base/user-request.error";
import { UserContext } from "@common/request-context";
import { EventsService } from "@services/events/events.service";
import { EventIdentifiers } from "@services/events/events";
import { UsersService } from "@modules/users/users.service";
import { ConfigService } from "@services/config/config.service";
import { DatabaseService } from "@services/database/database.service";
import { sessions, users } from "@services/database/schema/schema";
import { SystemError } from "@services/errors/base/system.error";
import { Cron } from "@nestjs/schedule";

export interface Session {
	id: string;
	userId: string;
	expiresAt: string;
}
export interface SessionWithUser extends Session {
	verifiedAt: string | null;
	role: Roles;
}

export interface OwnershipGuardOptions {
	userContext: UserContext;
	ownerId: string;
	allowAdminBypass?: boolean;
	allowUnverifiedUser?: boolean;
}

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly tokenService: TokenService,
		private readonly configService: ConfigService,
		private readonly emailService: EmailService,
		private readonly eventsService: EventsService,
		private readonly databaseService: DatabaseService,
	) {}

	onApplicationBootstrap() {
		this.eventsService.subscribe(EventIdentifiers.USER_CREATE, (event) => {
			this.requestVerifyEmail(event.detail.user.id);
		});
	}

	async login(email: string, password: string): Promise<AuthUserResponse> {
		let databaseUserDto: DatabaseUserDto;

		try {
			databaseUserDto = await this.usersService._UNSAFE_getByEmail(email);
		} catch (e) {
			throw new AccessForbiddenError({
				identifier: ErrorIdentifiers.AUTH_CREDENTIALS_INVALID,
				message: "The supplied email & password combination is invalid.",
				userMessage: "The supplied email & password combination is invalid.",
				cause: e,
			});
		}

		const passwordValid = await PasswordService.checkPassword(password, databaseUserDto.passwordHash);
		if (!passwordValid) {
			throw new AccessForbiddenError({
				identifier: ErrorIdentifiers.AUTH_CREDENTIALS_INVALID,
				message: "The supplied email & password combination is invalid.",
				userMessage: "The supplied email & password combination is invalid.",
			});
		}

		const userDto = UsersService.convertDatabaseItemToDto(databaseUserDto);
		const session = await this.createSession(databaseUserDto.id);

		this.eventsService.dispatch({
			type: EventIdentifiers.AUTH_LOGIN,
			detail: {
				userId: databaseUserDto.id,
				sessionId: session.id,
			},
		});

		return {
			user: userDto,
			sessionToken: session.token,
		};
	}

	async requestVerifyEmail(userId: string) {
		const user = await this.usersService._UNSAFE_getById(userId);
		if (user.verifiedAt) {
			throw new UserRequestError({
				identifier: ErrorIdentifiers.AUTH_NOT_VERIFIED,
				userMessage: "The given account has already been verified.",
			});
		}

		const verificationToken = this.tokenService.getActionToken({
			userId: user.id,
			actionType: "verify-email",
			secret: this.configService.vars.auth.emailVerification.secret,
			expiry: this.configService.vars.auth.emailVerification.expiry,
		});

		const verificationUrl = `${this.configService.vars.auth.emailVerification.url}#${verificationToken}`;

		await this.emailService.sendEmail({
			to: user.email,
			subject: `Account verification for ${this.configService.vars.general.applicationName}`,
			message: `To verify your account you can follow this link: ${verificationUrl}`,
		});
	}

	async verifyEmail(userContext: UserContext, actionToken: string): Promise<UserDto> {
		const user = await this.usersService._UNSAFE_getById(userContext.id);

		if (user.verifiedAt) {
			throw new UserRequestError({
				identifier: ErrorIdentifiers.AUTH_NOT_VERIFIED,
				userMessage: "The given account has already been verified.",
			});
		}

		const tokenPayload = this.tokenService.validateAndDecodeActionToken(actionToken, this.configService.vars.auth.emailVerification.secret);
		if (!tokenPayload) {
			throw new UserRequestError({
				identifier: ErrorIdentifiers.AUTH_TOKEN_INVALID,
				userMessage: "The supplied token is invalid.",
			});
		}

		if (tokenPayload.sub !== userContext.id) {
			throw new AccessForbiddenError({
				identifier: ErrorIdentifiers.AUTH_NOT_VERIFIED,
				userMessage: "The supplied token subject does not match the account requesting the verification.",
			});
		}

		return this.usersService.verifyUser(user.id);
	}

	async createSession(userId: string): Promise<{ token: string; id: string }> {
		const db = this.databaseService.getDatabase();

		// todo: this is probably very wrong due to JS Date/timezone things, need to double check
		const currentTime = new Date().getTime();
		const timeToExpiry = ms("7 days" as ms.StringValue);
		const expiresAt = new Date(currentTime + timeToExpiry).toISOString();

		const sessionId = randomUUID();
		const sessionToken = Buffer.from(randomBytes(32)).toString("hex");

		try {
			await db.insert(sessions).values({
				id: sessionId,
				token: sessionToken,
				userId: userId,
				expiresAt: expiresAt,
			});
		} catch (error) {
			throw new SystemError({
				message: "An unexpected error occurred while creating user session.",
				cause: error,
			});
		}

		return { id: sessionId, token: sessionToken };
	}

	async validateSession(sessionToken: string): Promise<SessionWithUser | null> {
		const db = this.databaseService.getDatabase();

		let session: SessionWithUser | null;
		try {
			const result = await db
				.select({
					...getTableColumns(sessions),
					verifiedAt: users.verifiedAt,
					role: users.role,
				})
				.from(sessions)
				.where(eq(sessions.token, sessionToken))
				.innerJoin(users, eq(sessions.userId, users.id));
			session = result[0];
		} catch (error) {
			throw new SystemError({
				message: "An unexpected error occurred while validating user session.",
				cause: error,
			});
		}

		if (!session) return null;

		const now = new Date().toISOString();
		if (session.expiresAt > now) return session;

		try {
			await db.delete(sessions).where(eq(sessions.token, sessionToken));
		} catch (error) {
			throw new SystemError({
				message: `An unexpected error occurred while removing the expired session: ${session.id}.`,
				cause: error,
			});
		}

		return null;
	}

	async revokeSession(userContext: UserContext): Promise<void> {
		try {
			const db = this.databaseService.getDatabase();
			await db.delete(sessions).where(eq(sessions.id, userContext.sessionId));
		} catch (error) {
			throw new SystemError({
				message: "An unexpected error occurred while revoking user session.",
				cause: error,
			});
		}

		this.eventsService.dispatch({
			type: EventIdentifiers.AUTH_LOGOUT,
			detail: {
				userId: userContext.id,
				sessionId: userContext.sessionId,
			},
		});
	}

	async guardOwnership({ userContext, ownerId, allowAdminBypass, allowUnverifiedUser }: OwnershipGuardOptions): Promise<void> {
		// If allowed, admin users bypass all checks and can access everything.
		if (allowAdminBypass && userContext.role === "admin" && userContext.verifiedAt) return;

		// Unverified users should not be allowed to perform any actions (unless bypassed)
		if (!allowUnverifiedUser && !userContext.verifiedAt) {
			throw new AccessForbiddenError({
				identifier: ErrorIdentifiers.AUTH_NOT_VERIFIED,
				userMessage: "You are unverified and unable to perform this action.",
			});
		}

		// Users should only be able to access resources they own.
		if (userContext.id == ownerId) return;

		throw new AccessForbiddenError({
			userMessage: "You do not have the permissions required to perform this action.",
		});
	}

	async guardAdminAction(userContext: UserContext): Promise<void> {
		if (userContext.role !== "admin") {
			throw new AccessForbiddenError({
				userMessage: "You do not have the permissions required to perform this action.",
			});
		}
	}

	@Cron("@hourly")
	async removeOldSessions() {
		const db = this.databaseService.getDatabase();
		const now = new Date().toISOString();

		try {
			await db.delete(sessions).where(lte(sessions.expiresAt, now));
		} catch (error) {
			throw new SystemError({
				message: "An unexpected error occurred while removing expired sessions.",
				cause: error,
			});
		}
	}
}
