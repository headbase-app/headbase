import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AccessUnauthorizedError } from "@services/errors/access/access-unauthorized.error";
import { RequestWithContext, UserContext } from "@common/request-context";
import { TokenService } from "@services/token/token.service";
import { AccessControlService } from "@modules/auth/access-control.service";

/**
 * An authentication guard which sits at the controller layer.
 * It ensures users are authenticated and adds user context to the request.
 *
 * THIS GUARD DOES NOT HANDLE AUTHORIZATION WHICH IS LOGIC FOR THE SERVICE LAYER.
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {
	constructor(private tokenService: TokenService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const authorizationHeader = request.header("authorization");
		if (authorizationHeader) {
			const accessToken = authorizationHeader.split(" ")[1];

			// todo: this is reused in AuthGatewayGuard. Should be a separate function?
			if (accessToken) {
				const tokenPayload = await this.tokenService.validateAndDecodeAccessToken(accessToken);
				if (tokenPayload) {
					this.attachRequestContext(request, {
						id: tokenPayload.sub,
						sessionId: tokenPayload.sid,
						verifiedAt: tokenPayload.verifiedAt,
						// todo: should depend on service not static method, or method should be moved?
						permissions: AccessControlService.resolveRolePermissions(tokenPayload.role),
					});
				}
			}
		}

		throw new AccessUnauthorizedError({
			message: "You are not authorized to perform that action",
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
