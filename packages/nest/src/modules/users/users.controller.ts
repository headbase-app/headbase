import { Body, Controller, Get, Post, UseGuards, Param, Patch, Delete } from "@nestjs/common";

import { CreateUserDto, UpdateUserDto, UsersURLParams } from "@headbase-app/contracts";
import { UsersService } from "@modules/users/users.service";
import { TokenService } from "@services/token/token.service";
import { ZodValidationPipe } from "@common/zod-validator.pipe";
import { AuthenticationGuard } from "@modules/auth/auth.guard";
import { RequestContext } from "@common/request-context";

@Controller({
	path: "/users",
	version: "1",
})
export class UsersHttpController {
	constructor(
		private usersService: UsersService,
		private tokenService: TokenService,
	) {}

	@Post()
	async createUser(@Body(new ZodValidationPipe(CreateUserDto)) createUserDto: CreateUserDto) {
		const newUser = await this.usersService.create(createUserDto);
		const createdTokenPair = await this.tokenService.createNewTokenPair(newUser);

		return {
			user: newUser,
			tokens: createdTokenPair.tokens,
		};
	}

	@Get("/:id")
	@UseGuards(AuthenticationGuard)
	async getUser(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(UsersURLParams)) params: UsersURLParams) {
		return this.usersService.get(requestContext.user, params.userId);
	}

	@Patch("/:id")
	@UseGuards(AuthenticationGuard)
	async updateUser(
		@RequestContext() requestContext: RequestContext,
		@Param(new ZodValidationPipe(UsersURLParams)) params: UsersURLParams,
		@Body(new ZodValidationPipe(UpdateUserDto)) updateUserDto: UpdateUserDto,
	) {
		return this.usersService.update(requestContext.user, params.userId, updateUserDto);
	}

	@Delete("/:id")
	@UseGuards(AuthenticationGuard)
	async deleteUser(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(UsersURLParams)) params: UsersURLParams) {
		return this.usersService.delete(requestContext.user, params.userId);
	}
}
