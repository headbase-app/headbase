import jsonwebtoken from "jsonwebtoken";
import ms from "ms";
import { createSecretKey } from "crypto";
import { Injectable } from "@nestjs/common";

/**
 * Allow importing the pure ESM module 'uuid' in CJS.
 */
async function createUUID() {
	return (await import("uuid")).v4();
}

import { AccessTokenPayload, ActionTokenOptions, ActionTokenPayload, RefreshTokenPayload, TokenPair, UserDto } from "@headbase-app/contracts";

import { CacheStoreService } from "@services/cache-store/cache-store.service";
import { SystemError } from "@services/errors/base/system.error";
import { ConfigService } from "@services/config/config.service";

export interface CreatedTokenPair {
	sessionId: string;
	tokens: TokenPair;
}

/**
 * Provides functionality to sign and verify json web tokens (JWTs).
 *
 * todo: consider switching to @nestjs/jwt over custom service?
 */
@Injectable()
export class TokenService {
	constructor(
		private configService: ConfigService,
		private dataStoreService: CacheStoreService,
	) {}

	/**
	 * Take an expiry string such as "15 mins" and convert it to an epoch timestamp.
	 *
	 * @param expiryString
	 * @private
	 */
	private _parseTokenExpiry(expiryString: string) {
		const currentTime = new Date().getTime();
		const timeToExpiry = ms(expiryString as ms.StringValue);
		return currentTime + timeToExpiry;
	}

	/**
	 * Create a new token pair for the given user.
	 *
	 * @param userDto
	 */
	async createNewTokenPair(userDto: UserDto): Promise<CreatedTokenPair> {
		const sessionId = await createUUID();
		const counterId = 1;

		// Generate the expiry of the refresh token here so I can set an initial expiry on the sid value stored.
		// This expiry is then updated as the token is refreshed.
		// todo: the expiry of the stored sid doesn't exactly match the refresh tokens expiry as set by jsonwebtoken.
		const expiry = this._parseTokenExpiry(this.configService.vars.auth.refreshToken.expiry);

		await this._setSessionCounterId(sessionId, counterId, expiry);
		const tokenPair = this._getTokenPair(userDto, sessionId, counterId);

		return {
			sessionId: sessionId,
			tokens: tokenPair,
		};
	}

	/**
	 * Create a new token pair for the given user's token session.
	 *
	 * @param userDto
	 * @param sessionId
	 */
	async getRefreshedTokenPair(userDto: UserDto, sessionId: string): Promise<TokenPair> {
		const counterId = await this._getSessionCounterId(sessionId);
		if (!counterId) {
			throw new SystemError({
				message: `Failed to find cid for token session '${sessionId}' for user '${userDto.id}.'`,
			});
		}

		// Update the expiry of the sequence id to match the newly generated refresh token.
		// todo: the expiry of the stored sid doesn't exactly match the refresh tokens expiry as set by jsonwebtoken.
		const expiry = this._parseTokenExpiry(this.configService.vars.auth.refreshToken.expiry);
		await this._setSessionCounterId(sessionId, counterId + 1, expiry);

		return this._getTokenPair(userDto, sessionId, counterId + 1);
	}

	/**
	 * Return a token pair for the given user, session and counter ID.
	 *
	 * @param userDto
	 * @param sessionId
	 * @param counterId
	 * @private
	 */
	private _getTokenPair(userDto: UserDto, sessionId: string, counterId: number): TokenPair {
		const basicPayload = {
			iss: this.configService.vars.auth.issuer || "headbase",
			aud: this.configService.vars.auth.audience || "headbase",
			sub: userDto.id,
			sid: sessionId,
			cid: counterId,
		};

		const accessTokenPayload = {
			...basicPayload,
			type: "accessToken",
			verifiedAt: userDto.verifiedAt,
			role: userDto.role,
		};
		const accessTokenSecret = createSecretKey(Buffer.from(this.configService.vars.auth.accessToken.secret));
		const accessToken = jsonwebtoken.sign(accessTokenPayload, accessTokenSecret, { expiresIn: this.configService.vars.auth.accessToken.expiry as ms.StringValue });

		const refreshTokenPayload = {
			...basicPayload,
			type: "refreshToken",
		};
		const refreshTokenSecret = createSecretKey(Buffer.from(this.configService.vars.auth.refreshToken.secret));
		const refreshToken = jsonwebtoken.sign(refreshTokenPayload, refreshTokenSecret, { expiresIn: this.configService.vars.auth.refreshToken.expiry as ms.StringValue });

		return {
			accessToken,
			refreshToken,
		};
	}

	/**
	 * Validate the given access token. Return its payload if valid or null if not.
	 * @param accessToken
	 */
	async validateAndDecodeAccessToken(accessToken: string): Promise<AccessTokenPayload | null> {
		try {
			const payload = jsonwebtoken.verify(accessToken, this.configService.vars.auth.accessToken.secret) as unknown as AccessTokenPayload;
			const isValidToken = await this._validateCustomAuthClaims(payload.sid, payload.cid);
			if (isValidToken) {
				return payload;
			}
		} catch (err) {
			// verify will throw an error if it fails, but we want to return null in this situation.
		}

		return null;
	}

	/**
	 * Validate the given refresh token. Return its payload if valid or null if not.
	 * @param refreshToken
	 */
	async validateAndDecodeRefreshToken(refreshToken: string): Promise<RefreshTokenPayload | null> {
		try {
			const payload = jsonwebtoken.verify(refreshToken, this.configService.vars.auth.refreshToken.secret) as unknown as RefreshTokenPayload;
			const isValidToken = await this._validateCustomAuthClaims(payload.sid, payload.cid);
			if (isValidToken) {
				return payload;
			}
		} catch (err) {
			// verify will throw an error if it fails
		}

		return null;
	}

	/**
	 * Validate the custom auth claims of the token.
	 * These are the sid and cid values.
	 *
	 * @param sessionId
	 * @param counterId
	 */
	async _validateCustomAuthClaims(sessionId: string, counterId: number) {
		const isBlacklisted = await this._isSessionBlacklisted(sessionId);
		if (isBlacklisted) {
			return false;
		}

		const storedCounterId = await this._getSessionCounterId(sessionId);
		return counterId === storedCounterId;
	}

	/**
	 * Blacklist the given token session.
	 *
	 * @param sessionId
	 * @param expiry
	 */
	async blacklistSession(sessionId: string, expiry: number) {
		await this.dataStoreService.addItem(`bl-${sessionId}`, "true", {
			epochExpiry: expiry,
		});
	}

	/**
	 * Determine if the given session has been blacklisted.
	 *
	 * @param sessionId
	 * @private
	 */
	private async _isSessionBlacklisted(sessionId: string): Promise<boolean> {
		return (await this.dataStoreService.getItem(`bl-${sessionId}`)) !== null;
	}

	/**
	 * Set the counter ID for the given token session.
	 *
	 * @param sessionId
	 * @param counterId
	 * @param expiry
	 * @private
	 */
	private async _setSessionCounterId(sessionId: string, counterId: number, expiry: number): Promise<void> {
		await this.dataStoreService.addItem(`cid-${sessionId}`, counterId.toString(), { epochExpiry: expiry });
	}

	/**
	 * Fetch the counter ID for the supplied token session.
	 * Will return null if the counter ID doesn't exist or is invalid.
	 *
	 * @param sessionId
	 * @private
	 */
	private async _getSessionCounterId(sessionId: string): Promise<number | null> {
		const counterIdIdString = await this.dataStoreService.getItem(`cid-${sessionId}`);
		if (!counterIdIdString) {
			return null;
		}

		try {
			return parseInt(counterIdIdString);
		} catch (e) {
			// todo: should do special handling if the data is invalid?
			return null;
		}
	}

	/**
	 * Fetch an action token which can authenticated a user for actions like password
	 *
	 * @param options
	 */
	getActionToken(options: ActionTokenOptions) {
		const basicPayload = {
			iss: this.configService.vars.auth.issuer || "headbase",
			aud: this.configService.vars.auth.audience || "headbase",
			sub: options.userId,
		};

		const actionTokenPayload = {
			...basicPayload,
			type: options.actionType,
		};

		const secret = createSecretKey(Buffer.from(options.secret));
		return jsonwebtoken.sign(actionTokenPayload, secret, { expiresIn: options.expiry as ms.StringValue });
	}

	/**
	 * Validate if an action token is valid.
	 * This method DOES NOT VALIDATE THE PAYLOAD to check the userId/'sub' claim, as the decision on if that logical check
	 * is required is better suited to the service in which this method is used.
	 *
	 * @param actionToken
	 * @param secret
	 */
	validateAndDecodeActionToken(actionToken: string, secret: string): ActionTokenPayload | null {
		try {
			return jsonwebtoken.verify(actionToken, secret) as unknown as ActionTokenPayload;
		} catch (err) {
			// verify will throw an error if it fails, but we want to return null in this situation.
		}

		return null;
	}
}
