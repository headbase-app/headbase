import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";

import { LoginRequest, VerifyEmailDto } from "@headbase-app/contracts";

import { AuthService } from "@modules/auth/auth.service";
import { ZodValidationPipe } from "@common/zod-validator.pipe";
import { RequestContext } from "@common/request-context";
import { AuthenticationGuard } from "@modules/auth/auth.guard";

@Controller({
	path: "/auth",
	version: "1",
})
export class AuthHttpController {
	constructor(private readonly authService: AuthService) {}

	@Post("/login")
	@HttpCode(HttpStatus.OK)
	async login(@Body(new ZodValidationPipe(LoginRequest)) loginRequest: LoginRequest) {
		return this.authService.login(loginRequest.email, loginRequest.password);
	}

	@Post("/logout")
	@UseGuards(AuthenticationGuard)
	@HttpCode(HttpStatus.OK)
	async logout(@RequestContext() requestContext: RequestContext) {
		await this.authService.revokeSession(requestContext.user);
		return { statusCode: HttpStatus.OK };
	}

	@Get("/check")
	@UseGuards(AuthenticationGuard)
	check() {
		return { statusCode: HttpStatus.OK };
	}

	/**
	 * An endpoint where users can request email verification emails.
	 * Will always succeed regardless of if the email address supplied was valid and/or an email was actually sent
	 */
	@Get("/verify-email")
	@UseGuards(AuthenticationGuard)
	async requestVerifyEmail(@RequestContext() requestContext: RequestContext) {
		await this.authService.requestVerifyEmail(requestContext.user.id);
		return { statusCode: HttpStatus.OK };
	}

	/**
	 * An endpoint where users can verify their account
	 */
	@Post("/verify-email")
	@UseGuards(AuthenticationGuard)
	@HttpCode(HttpStatus.OK)
	async verifyEmail(@RequestContext() requestContext: RequestContext, @Body(new ZodValidationPipe(VerifyEmailDto)) verifyEmailDto: VerifyEmailDto) {
		return this.authService.verifyEmail(requestContext.user, verifyEmailDto.token);
	}

	@Get("/change-email")
	requestChangeEmail() {
		return {
			statusCode: HttpStatus.NOT_IMPLEMENTED,
			message: "Email change has not been implemented yet",
		};
	}

	@Post("/change-email")
	@HttpCode(HttpStatus.OK)
	changeEmail() {
		return {
			statusCode: HttpStatus.NOT_IMPLEMENTED,
			message: "Email change has not been implemented yet",
		};
	}

	@Get("/reset-password")
	@HttpCode(HttpStatus.OK)
	requestResetPassword() {
		return {
			statusCode: HttpStatus.NOT_IMPLEMENTED,
			message: "Password reset has not been implemented yet",
		};
	}

	@Post("/reset-password")
	@HttpCode(HttpStatus.OK)
	resetPassword() {
		return {
			statusCode: HttpStatus.NOT_IMPLEMENTED,
			message: "Password reset has not been implemented yet",
		};
	}
}
