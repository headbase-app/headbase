import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";

import { ChunkDto, ChunksURLParams } from "@headbase-app/contracts";

import { ChunksService } from "@modules/chunks/chunks.service";
import { AuthenticationGuard } from "@modules/auth/auth.guard";
import { RequestContext } from "@common/request-context";
import { ZodValidationPipe } from "@common/zod-validator.pipe";

@Controller({
	path: "/chunks",
	version: "1",
})
@UseGuards(AuthenticationGuard)
export class ChunksHttpController {
	constructor(private readonly chunksService: ChunksService) {}

	@Post()
	async create(@RequestContext() requestContext: RequestContext, @Body(new ZodValidationPipe(ChunkDto)) chunkDto: ChunkDto) {
		return this.chunksService.create(requestContext.user, chunkDto);
	}

	@Post(":hash/upload")
	@HttpCode(HttpStatus.OK)
	async requestUpload(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(ChunksURLParams)) params: ChunksURLParams) {
		return this.chunksService.requestUpload(requestContext.user, params.hash);
	}

	@Post(":hash/download")
	@HttpCode(HttpStatus.OK)
	async requestDownload(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(ChunksURLParams)) params: ChunksURLParams) {
		return this.chunksService.requestDownload(requestContext.user, params.hash);
	}
}
