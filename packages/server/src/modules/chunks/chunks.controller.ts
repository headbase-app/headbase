import { Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";

import { ChunksURLParams } from "@headbase-app/contracts";

import { ChunksService } from "@modules/chunks/chunks.service.js";
import { AuthenticationGuard } from "@modules/auth/auth.guard.js";
import { RequestContext } from "@common/request-context.js";
import { ZodValidationPipe } from "@common/zod-validator.pipe.js";

@Controller({
	path: "/chunks",
	version: "1",
})
@UseGuards(AuthenticationGuard)
export class ChunksHttpController {
	constructor(private readonly chunksService: ChunksService) {}

	@Post(":vaultId/:hash")
	@HttpCode(HttpStatus.OK)
	async requestUpload(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(ChunksURLParams)) params: ChunksURLParams) {
		const url = await this.chunksService.requestUpload(requestContext.user, params.vaultId, params.hash);

		// todo: service should return object?
		return { url };
	}

	@Get(":vaultId/:hash")
	@HttpCode(HttpStatus.OK)
	async requestDownload(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(ChunksURLParams)) params: ChunksURLParams) {
		const url = await this.chunksService.requestDownload(requestContext.user, params.vaultId, params.hash);

		// todo: service should return object?
		return { url };
	}
}
