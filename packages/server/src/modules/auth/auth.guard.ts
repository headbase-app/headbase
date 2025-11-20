import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { AccessUnauthorizedError } from "@services/errors/access/access-unauthorized.error.js";
import { RequestWithContext, UserContext } from "@common/request-context.js";
import { AuthService } from "@modules/auth/auth.service.js";

/**
 * An authentication guard which sits at the controller layer.
 * It ensures users are authenticated and adds user context to the request.
 *
 * THIS GUARD DOES NOT HANDLE AUTHORIZATION WHICH IS LOGIC FOR THE SERVICE LAYER.
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<RequestWithContext>();

		const authorizationHeader = request.header("authorization");
		const sessionToken = authorizationHeader?.split(" ")[1];

		if (sessionToken) {
			// todo: this is reused in AuthGatewayGuard. Should be a separate function?
			const sessionDetails = await this.authService.validateSession(sessionToken);
			if (sessionDetails) {
				this.attachRequestContext(request, {
					id: sessionDetails.userId,
					sessionId: sessionDetails.id,
					verifiedAt: sessionDetails.verifiedAt,
					role: sessionDetails.role,
				});
				return true;
			}
		}

		throw new AccessUnauthorizedError({
			message: "You are not authenticated to perform that action.",
		});
	}

	attachRequestContext(req: RequestWithContext, userContext: UserContext) {
		if (req.context) {
			req.context.user = userContext;
		} else {
			req.context = {
				user: userContext,
			};
		}
	}
}
