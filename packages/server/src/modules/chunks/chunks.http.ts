import {NextFunction, Request, Response} from "express";
import {z} from "zod";
import {ChunkDto, ChunksURLParams} from "@headbase-app/contracts";
import {validateSchema} from "@common/schema-validator.js";
import {HttpStatusCodes} from "@common/http-status-codes.js";
import {ChunksService} from "@modules/chunks/chunks.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";

// todo: move to contracts package
export const CreateChunkDto = z.union([ChunkDto, z.array(ChunkDto)])
export type CreateChunkDto = z.infer<typeof CreateChunkDto>

export class ChunksHttpAdapter {
  constructor(
		private readonly accessControlService: AccessControlService,
    private chunksService: ChunksService,
  ) {}

	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const requestUser = await this.accessControlService.validateAuthentication(req);
			const createChunkDto = await validateSchema(req.body, CreateChunkDto);
			const results = await this.chunksService.create(requestUser, createChunkDto);
			res.status(HttpStatusCodes.OK).json(results);
		}
		catch (error) {
			next(error);
		}
	}

	async requestUpload(req: Request, res: Response, next: NextFunction) {
		try {
			const requestUser = await this.accessControlService.validateAuthentication(req);
			const params = await validateSchema(req.params, ChunksURLParams);
			const uploadUrl = await this.chunksService.requestUpload(requestUser, params.hash);
			res.status(HttpStatusCodes.OK).json(uploadUrl);
		}
		catch (error) {
			next(error);
		}
	}

	async requestDownload(req: Request, res: Response, next: NextFunction) {
		try {
			const requestUser = await this.accessControlService.validateAuthentication(req);
			const params = await validateSchema(req.params, ChunksURLParams);
			const uploadUrl = await this.chunksService.requestDownload(requestUser, params.hash);
			res.status(HttpStatusCodes.OK).json(uploadUrl);
		}
		catch (error) {
			next(error);
		}
	}
}
