import { Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { z } from "zod";

import { ChunksURLParams, VaultDto } from "@headbase-app/contracts";

import { ChunksService } from "@modules/chunks/chunks.service";
import { AuthenticationGuard } from "@modules/auth/auth.guard";
import { RequestContext } from "@common/request-context";
import { ZodValidationPipe } from "@common/zod-validator.pipe";

// todo: remove and replace with updated ChunksURLParams from contracts package
const ChunksURLParamsTemp = ChunksURLParams.extend({
	vaultId: VaultDto.shape.id,
});
type ChunksURLParamsTemp = z.infer<typeof ChunksURLParamsTemp>;

@Controller({
	path: "/chunks",
	version: "1",
})
@UseGuards(AuthenticationGuard)
export class ChunksHttpController {
	constructor(private readonly chunksService: ChunksService) {}

	@Post(":vaultId/:hash")
	@HttpCode(HttpStatus.OK)
	async requestUpload(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(ChunksURLParamsTemp)) params: ChunksURLParamsTemp) {
		const url = await this.chunksService.requestUpload(requestContext.user, params.vaultId, params.hash);

		// todo: service should return object?
		return { url };
	}

	@Get(":vaultId/:hash")
	@HttpCode(HttpStatus.OK)
	async requestDownload(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(ChunksURLParamsTemp)) params: ChunksURLParamsTemp) {
		const url = await this.chunksService.requestDownload(requestContext.user, params.vaultId, params.hash);

		// todo: service should return object?
		return { url };
	}
}
