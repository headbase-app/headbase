import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";

import { CreateFileDto, FilesURLParams, FilesQueryParams } from "@headbase-app/contracts";

import { AuthenticationGuard } from "@modules/auth/auth.guard.js";
import { FilesService } from "@modules/files/files.service.js";
import { RequestContext } from "@common/request-context.js";
import { ZodValidationPipe } from "@common/zod-validator.pipe.js";

@Controller({
	path: "/files",
	version: "1",
})
@UseGuards(AuthenticationGuard)
export class FilesHttpController {
	constructor(private readonly filesService: FilesService) {}

	@Post()
	create(@RequestContext() requestContext: RequestContext, @Body(new ZodValidationPipe(CreateFileDto)) createFileDto: CreateFileDto) {
		return this.filesService.create(requestContext.user, createFileDto);
	}

	@Get()
	query(@RequestContext() requestContext: RequestContext, @Query(new ZodValidationPipe(FilesQueryParams)) query: FilesQueryParams) {
		return this.filesService.query(requestContext.user, query);
	}

	@Get(":fileId")
	get(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(FilesURLParams)) params: FilesURLParams) {
		return this.filesService.get(requestContext.user, params.fileId);
	}

	@Delete(":fileId")
	delete(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(FilesURLParams)) params: FilesURLParams) {
		return this.filesService.delete(requestContext.user, params.fileId);
	}

	@Post(":fileId/commit")
	commit(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(FilesURLParams)) params: FilesURLParams) {
		return this.filesService.commit(requestContext.user, params.fileId);
	}

	@Get(":fileId/chunks")
	getChunks(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(FilesURLParams)) params: FilesURLParams) {
		return this.filesService.getChunks(requestContext.user, params.fileId);
	}
}
