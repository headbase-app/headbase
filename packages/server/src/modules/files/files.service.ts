import { Injectable } from "@nestjs/common";
import { count, desc, DrizzleQueryError, eq, getTableColumns, inArray } from "drizzle-orm";
import postgres from "postgres";
import { Cron } from "@nestjs/schedule";

import { CreateFileDto, ErrorIdentifiers, FileChunkDto, FileDto, FilesQueryParams } from "@headbase-app/contracts";

import { UserContext } from "@common/request-context.js";
import { PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION } from "@services/database/database-error-codes.js";
import { ResourceRelationshipError } from "@services/errors/resource/resource-relationship.error.js";
import { SystemError } from "@services/errors/base/system.error.js";
import { DatabaseService } from "@services/database/database.service.js";
import { EventsService } from "@services/events/events.service.js";
import { files, filesChunks, vaults } from "@services/database/schema/schema.js";
import { isoFormat } from "@services/database/schema/iso-format-date.js";
import { ResourceNotFoundError } from "@services/errors/resource/resource-not-found.error.js";
import { FileWithOwnerDto } from "@modules/files/file-with-owner.js";
import { VaultsService } from "@modules/vaults/vaults.service.js";
import { EventIdentifiers } from "@services/events/events.js";
import { UserRequestError } from "@services/errors/base/user-request.error.js";
import { ChunksService } from "@modules/chunks/chunks.service.js";
import { AuthService } from "@modules/auth/auth.service.js";

@Injectable()
export class FilesService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly eventsService: EventsService,
		private readonly authService: AuthService,
		private readonly vaultsService: VaultsService,
		private readonly chunksService: ChunksService,
	) {}

	private static getContextualError(e: any) {
		if (e instanceof DrizzleQueryError && e.cause instanceof postgres.PostgresError) {
			if (e.cause.code === PG_FOREIGN_KEY_VIOLATION) {
				if (e.cause.constraint_name === "files_vault") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.VAULT_NOT_FOUND,
						userMessage: "Attempted to add a file to vault that doesn't exist.",
					});
				}
			}
			if (e.cause.code === PG_UNIQUE_VIOLATION) {
				if (e.cause.constraint_name === "files_pk") {
					return new ResourceRelationshipError({
						identifier: ErrorIdentifiers.RESOURCE_NOT_UNIQUE,
						userMessage: "File with given version id already exists.",
					});
				}
			}
		}

		return new SystemError({
			message: "Unexpected error while executing vault query",
			cause: e,
		});
	}

	convertFileWithOwner(fileWithOwnerDto: FileWithOwnerDto): FileDto {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- purposely removing ownerId from object.
		const { ownerId, ...fileDto } = fileWithOwnerDto;
		return fileDto;
	}

	async #getWithOwner(versionId: string): Promise<FileWithOwnerDto> {
		const db = this.databaseService.getDatabase();

		let result: FileWithOwnerDto[];
		try {
			result = (await db
				.select({
					...getTableColumns(files),
					createdAt: isoFormat(files.createdAt),
					updatedAt: isoFormat(files.updatedAt),
					deletedAt: isoFormat(files.deletedAt),
					committedAt: isoFormat(files.committedAt),
					ownerId: vaults.ownerId,
				})
				.from(files)
				.innerJoin(vaults, eq(files.vaultId, vaults.id))
				.where(eq(files.versionId, versionId))) as unknown as FileWithOwnerDto[];
		} catch (e) {
			throw FilesService.getContextualError(e);
		}
		if (!result[0]) {
			throw new ResourceNotFoundError({
				identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
				userMessage: "The requested file could not be found.",
			});
		}

		return result[0];
	}

	async get(userContext: UserContext, versionId: string) {
		const fileWithOwner = await this.#getWithOwner(versionId);

		await this.authService.guardOwnership({
			userContext,
			ownerId: fileWithOwner.ownerId,
			allowAdminBypass: true,
		});

		return this.convertFileWithOwner(fileWithOwner);
	}

	async create(userContext: UserContext, createFileDto: CreateFileDto) {
		const vault = await this.vaultsService.get(userContext, createFileDto.vaultId);

		await this.authService.guardOwnership({
			userContext,
			ownerId: vault.ownerId,
			allowAdminBypass: true,
		});

		const { chunks: fileChunks, ...fileDto } = createFileDto;

		const chunksToCreate = fileChunks.map((chunk) => ({
			...chunk,
			versionId: fileDto.versionId,
		}));

		// todo: validate chunk integrity, at least that filePosition values are sequential and complete.

		const db = this.databaseService.getDatabase();
		let createdFile: FileDto | null;
		try {
			// Wrapping file + chunks creation into transaction to ensure data integrity.
			const result = await db.transaction(async (tx) => {
				const newFile = (await tx
					.insert(files)
					.values(fileDto)
					.returning({
						...getTableColumns(files),
						createdAt: isoFormat(files.createdAt),
						updatedAt: isoFormat(files.updatedAt),
						deletedAt: isoFormat(files.deletedAt),
						committedAt: isoFormat(files.committedAt),
					})) as unknown as FileDto[];

				await tx.insert(filesChunks).values(chunksToCreate);
				return newFile;
			});
			createdFile = result[0];
		} catch (e) {
			throw FilesService.getContextualError(e);
		}

		if (!createdFile) {
			throw new SystemError({
				identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED,
				userMessage: "Returning file after creation failed",
			});
		}

		this.eventsService.dispatch({
			type: EventIdentifiers.FILES_CREATE,
			detail: {
				sessionId: userContext.sessionId,
				file: createdFile,
			},
		});

		return createdFile;
	}

	async delete(userContext: UserContext, versionId: string) {
		const file = await this.#getWithOwner(versionId);
		await this.authService.guardOwnership({
			userContext,
			ownerId: file.ownerId,
			allowAdminBypass: true,
		});

		const db = this.databaseService.getDatabase();
		try {
			await db.delete(files).where(eq(files.versionId, versionId));
		} catch (e) {
			throw FilesService.getContextualError(e);
		}

		this.eventsService.dispatch({
			type: EventIdentifiers.FILES_DELETE,
			detail: {
				sessionId: userContext.sessionId,
				vaultId: file.vaultId,
				id: versionId,
			},
		});
	}

	async query(userContext: UserContext, query: FilesQueryParams) {
		// fetching vault upfront to check permissions
		// todo: improve/simplify permissions checks, should be separate service or explicit method?
		for (const vaultId of query.vaultIds) {
			await this.vaultsService.get(userContext, vaultId);
		}

		const offset = query.offset ?? 0;
		const limit = query.limit ?? 50;

		const db = this.databaseService.getDatabase();
		let resultsWithOwner: FileWithOwnerDto[];
		let total: number;
		try {
			resultsWithOwner = await db
				.select({
					...getTableColumns(files),
					createdAt: isoFormat(files.createdAt),
					updatedAt: isoFormat(files.updatedAt),
					deletedAt: isoFormat(files.deletedAt),
					committedAt: isoFormat(files.committedAt),
					ownerId: vaults.ownerId,
				})
				.from(files)
				.innerJoin(vaults, eq(files.vaultId, vaults.id))
				.where(inArray(files.vaultId, query.vaultIds))
				// todo: ordering will change as items are added, should be consistent?
				.orderBy(desc(files.createdAt))
				.limit(limit)
				.offset(offset);

			const totalQuery = await db
				.select({
					total: count(),
				})
				.from(files)
				.innerJoin(vaults, eq(files.vaultId, vaults.id))
				.where(inArray(files.vaultId, query.vaultIds));

			total = totalQuery[0].total;
		} catch (e) {
			throw FilesService.getContextualError(e);
		}

		const results: FileDto[] = [];
		for (const result of resultsWithOwner) {
			await this.authService.guardOwnership({
				userContext,
				ownerId: result.ownerId,
				allowAdminBypass: true,
			});
			results.push(this.convertFileWithOwner(result));
		}

		return {
			meta: {
				results: results.length,
				total: total,
				limit: limit,
				offset: offset,
			},
			results,
		};
	}

	async commit(userContext: UserContext, versionId: string) {
		const file = await this.#getWithOwner(versionId);
		await this.authService.guardOwnership({
			userContext,
			ownerId: file.ownerId,
			allowAdminBypass: true,
		});

		if (file.committedAt) {
			// todo: special error identifier?
			throw new UserRequestError({
				userMessage: "The given file is already committed",
			});
		}

		// todo: use #getChunks method which can avoid extra permissions check?
		const chunks = await this.getChunks(userContext, versionId);

		const unsavedChunks: string[] = [];
		for (const chunk of chunks) {
			const isStored = await this.chunksService.isUploaded(file.vaultId, chunk.chunkHash);
			if (!isStored) {
				unsavedChunks.push(chunk.chunkHash);
			}
		}

		if (unsavedChunks.length > 0) {
			throw new UserRequestError({
				userMessage: "The given file still has unsaved chunks and therefore can't be committed yet.",
				cause: unsavedChunks,
			});
		}

		const db = this.databaseService.getDatabase();
		const timestamp = new Date().toISOString();
		try {
			db.update(files).set({ committedAt: timestamp }).where(eq(files.versionId, versionId));
		} catch (e) {
			throw FilesService.getContextualError(e);
		}
	}

	async getChunks(userContext: UserContext, versionId: string) {
		const file = await this.#getWithOwner(versionId);
		await this.authService.guardOwnership({
			userContext,
			ownerId: file.ownerId,
			allowAdminBypass: true,
		});

		const db = this.databaseService.getDatabase();
		let results: FileChunkDto[];
		try {
			results = (await db.select().from(filesChunks).where(eq(filesChunks.versionId, versionId))) as unknown as FileChunkDto[];
		} catch (e) {
			throw FilesService.getContextualError(e);
		}

		return results;
	}

	// todo: dynamically schedule via SchedulerRegistry so can be adjusted via ConfigService?
	@Cron("@daily")
	async removeUncommittedFiles() {}

	@Cron("@weekly")
	async removeOldChunks() {}
}
