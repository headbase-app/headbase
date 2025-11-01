import jsonwebtoken from "jsonwebtoken";
import ms from "ms";
import { createSecretKey } from "node:crypto";
import { Injectable } from "@nestjs/common";

import { ActionTokenOptions, ActionTokenPayload } from "@headbase-app/contracts";

import { ConfigService } from "@services/config/config.service";

/**
 * Provides functionality to sign and verify json web tokens (JWTs).
 *
 * todo: consider switching to @nestjs/jwt over custom service?
 */
@Injectable()
export class TokenService {
	constructor(private configService: ConfigService) {}

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
