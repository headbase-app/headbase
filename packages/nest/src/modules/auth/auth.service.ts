import { Injectable } from "@nestjs/common";

import { TokenService } from "@services/token/token.service";
import { EmailService } from "@services/email/email.service";
import { AuthUserResponse, ErrorIdentifiers, TokenPair } from "@headbase-app/contracts";
import { DatabaseUserDto } from "@modules/users/database-user";
import { AccessForbiddenError } from "@services/errors/access/access-forbidden.error";
import { PasswordService } from "@services/password/password.service";
import { AccessUnauthorizedError } from "@services/errors/access/access-unauthorized.error";
import { UserRequestError } from "@services/errors/base/user-request.error";
import { UserContext } from "@common/request-context";
import { EventsService } from "@services/events/events.service";
import { EventIdentifiers } from "@services/events/events";
import { UsersService } from "@modules/users/users.service";
import { ConfigService } from "@services/config/config.service";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly tokenService: TokenService,
		private readonly configService: ConfigService,
		private readonly emailService: EmailService,
		private readonly eventsService: EventsService,
	) {
		// todo: would this be better setup somewhere else?
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
		const result = await this.tokenService.createNewTokenPair(userDto);

		this.eventsService.dispatch({
			type: EventIdentifiers.AUTH_LOGIN,
			detail: {
				userId: userDto.id,
				sessionId: result.sessionId,
			},
		});

		return {
			tokens: result.tokens,
			user: userDto,
		};
	}

	async refresh(refreshToken: string): Promise<TokenPair> {
		const tokenPayload = await this.tokenService.validateAndDecodeRefreshToken(refreshToken);

		if (!tokenPayload) {
			throw new AccessUnauthorizedError({
				identifier: ErrorIdentifiers.AUTH_TOKEN_INVALID,
				message: "The supplied refresh token is invalid.",
				userMessage: "The supplied refresh token is invalid.",
			});
		}

		// As the token has been validated the supplied userId/sub value in the token can be trusted in theory
		// If the user isn't found, the user service will throw an error.
		// todo: the user service throwing an error not returning null makes the error handling here unclear.
		const userDto = await this.usersService._UNSAFE_getById(tokenPayload.sub);

		return await this.tokenService.getRefreshedTokenPair(userDto, tokenPayload.sid);
	}

	async logout(refreshToken: string) {
		const tokenPayload = await this.tokenService.validateAndDecodeRefreshToken(refreshToken);

		if (!tokenPayload) {
			throw new UserRequestError({
				identifier: ErrorIdentifiers.AUTH_TOKEN_INVALID,
				userMessage: "The refresh token supplied is either invalid or already expired.",
			});
		}

		await this.tokenService.blacklistSession(tokenPayload.sid, tokenPayload.exp);

		this.eventsService.dispatch({
			type: EventIdentifiers.AUTH_LOGOUT,
			detail: {
				userId: tokenPayload.sub,
				sessionId: tokenPayload.sid,
			},
		});
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

	async verifyEmail(userContext: UserContext, actionToken: string): Promise<AuthUserResponse> {
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

		const updatedUser = await this.usersService.verifyUser(user.id);
		const result = await this.tokenService.createNewTokenPair(updatedUser);

		return {
			user: updatedUser,
			tokens: result.tokens,
		};
	}
}
