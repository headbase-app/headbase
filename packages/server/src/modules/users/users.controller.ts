import { Body, Controller, Get, Post, UseGuards, Param, Patch, Delete } from "@nestjs/common";

import { AuthUserResponse, CreateUserDto, UpdateUserDto, UsersURLParams } from "@headbase-app/contracts";
import { UsersService } from "@modules/users/users.service";
import { ZodValidationPipe } from "@common/zod-validator.pipe";
import { AuthenticationGuard } from "@modules/auth/auth.guard";
import { RequestContext } from "@common/request-context";
import { AuthService } from "@modules/auth/auth.service";

@Controller({
	path: "/users",
	version: "1",
})
export class UsersHttpController {
	constructor(
		private usersService: UsersService,
		private authService: AuthService,
	) {}

	@Post()
	async createUser(@Body(new ZodValidationPipe(CreateUserDto)) createUserDto: CreateUserDto): Promise<AuthUserResponse> {
		const newUser = await this.usersService.create(createUserDto);
		const session = await this.authService.createSession(newUser.id);

		return {
			user: newUser,
			sessionToken: session.token,
		};
	}

	@Get("/:userId")
	@UseGuards(AuthenticationGuard)
	async getUser(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(UsersURLParams)) params: UsersURLParams) {
		return this.usersService.get(requestContext.user, params.userId);
	}

	@Patch("/:userId")
	@UseGuards(AuthenticationGuard)
	async updateUser(
		@RequestContext() requestContext: RequestContext,
		@Param(new ZodValidationPipe(UsersURLParams)) params: UsersURLParams,
		@Body(new ZodValidationPipe(UpdateUserDto)) updateUserDto: UpdateUserDto,
	) {
		return this.usersService.update(requestContext.user, params.userId, updateUserDto);
	}

	@Delete("/:userId")
	@UseGuards(AuthenticationGuard)
	async deleteUser(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(UsersURLParams)) params: UsersURLParams) {
		return this.usersService.delete(requestContext.user, params.userId);
	}
}
