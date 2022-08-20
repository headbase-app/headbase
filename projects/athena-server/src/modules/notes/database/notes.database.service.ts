import {Injectable, ResourceNotFoundError, SystemError} from "@kangojs/core";
import {DatabaseService} from "../../../services/database/database.service";
import {Row, RowList} from "postgres";
import {
  AthenaErrorIdentifiers,
  CreateNoteRequest, DatabaseNoteDto, DatabaseNoteWithOwnerDto, ListOptions,
  MetaPaginationData,
  NoteDto, NoteWithOwnerDto,
  UpdateNoteRequest
} from "@ben-ryder/athena-js-lib";
import {NoteTagsDatabaseService} from "./note-tags.database.service";


@Injectable()
export class NotesDatabaseService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly noteTagsDatabaseService: NoteTagsDatabaseService
  ) {}

  private static mapApplicationField(fieldName: string): string {
    switch (fieldName) {
      case 'created_at':
        return 'createdAt';
      case 'updated_at':
        return 'updatedAt';
      default:
        return fieldName;
    }
  }

  private static convertDatabaseDtoToDto(note: DatabaseNoteDto): NoteDto {
    return {
      id: note.id,
      title: note.title,
      description: note.description,
      body: note.body,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      tags: []
    }
  }

  private static getDatabaseError(e: any) {
    return new SystemError({
      message: "Unexpected error while executing notes query",
      originalError: e
    })
  }

  async get(noteId: string): Promise<NoteDto> {
    const sql = await this.databaseService.getSQL();

    let result: DatabaseNoteDto[] = [];
    try {
      result = await sql<DatabaseNoteDto[]>`SELECT * FROM notes WHERE id = ${noteId}`;
    }
    catch (e: any) {
      throw NotesDatabaseService.getDatabaseError(e);
    }

    if (result.length > 0) {
      const tags = await this.noteTagsDatabaseService.getTags(noteId);

      return {
        ...NotesDatabaseService.convertDatabaseDtoToDto(result[0]),
        tags
      };
    }
    else {
      throw new ResourceNotFoundError({
        identifier: AthenaErrorIdentifiers.NOTE_NOT_FOUND,
        applicationMessage: "The requested note could not be found."
      })
    }
  }

  async getWithOwner(noteId: string): Promise<NoteWithOwnerDto> {
    const sql = await this.databaseService.getSQL();

    let result: DatabaseNoteWithOwnerDto[] = [];
    try {
      result = await sql<DatabaseNoteWithOwnerDto[]>`SELECT notes.*, vaults.owner FROM notes INNER JOIN vaults on notes.vault = vaults.id WHERE notes.id = ${noteId}`;
    }
    catch (e: any) {
      throw NotesDatabaseService.getDatabaseError(e);
    }

    if (result.length > 0) {
      const tags = await this.noteTagsDatabaseService.getTags(noteId);

      return {
        ...NotesDatabaseService.convertDatabaseDtoToDto(result[0]),
        owner: result[0].owner,
        tags
      }
    }
    else {
      throw new ResourceNotFoundError({
        identifier: AthenaErrorIdentifiers.NOTE_NOT_FOUND,
        applicationMessage: "The requested note could not be found."
      })
    }
  }

  async create(vaultId: string, note: CreateNoteRequest): Promise<NoteDto> {
    const sql = await this.databaseService.getSQL();

    let result: DatabaseNoteDto[] = [];
    try {
      result = await sql<DatabaseNoteDto[]>`
        INSERT INTO notes(id, title, description, body, created_at, updated_at, vault, folder) 
        VALUES (DEFAULT, ${note.title}, ${note.description || null}, ${note.body}, DEFAULT, DEFAULT, ${vaultId}, ${note.folder || null})
        RETURNING *;
       `;
    }
    catch (e: any) {
      throw NotesDatabaseService.getDatabaseError(e);
    }

    if (result.length > 0) {
      if (Array.isArray(note.tags)) {
        await this.noteTagsDatabaseService.updateTags(result[0].id, note.tags);
      }

      const tags = await this.noteTagsDatabaseService.getTags(result[0].id);
      return {
        ...NotesDatabaseService.convertDatabaseDtoToDto(result[0]),
        tags
      };
    }
    else {
      throw new SystemError({
        message: "Unexpected error returning note after creation",
      })
    }
  }

  async update(noteId: string, noteUpdate: UpdateNoteRequest): Promise<NoteDto> {
    const sql = await this.databaseService.getSQL();

    // If there are no supplied fields to update, then just return the existing user.
    if (Object.keys(noteUpdate).length === 0) {
      return this.get(noteId);
    }

    // Process all fields
    // todo: this offers no protection against updating fields like id which should never be updated
    let databaseUpdate: any = {};
    for (const fieldName of Object.keys(noteUpdate) as Array<keyof UpdateNoteRequest>) {
      if (fieldName !== "tags") {
        databaseUpdate[NotesDatabaseService.mapApplicationField(fieldName)] = noteUpdate[fieldName];
      }
    }

    if (Object.keys(databaseUpdate).length > 0) {
      try {
        await sql<DatabaseNoteDto[]>`
          UPDATE notes
          SET ${sql(databaseUpdate, ...Object.keys(databaseUpdate))}
          WHERE id = ${noteId}
        `;
      }
      catch (e: any) {
        throw NotesDatabaseService.getDatabaseError(e);
      }
    }

    if (Array.isArray(noteUpdate.tags)) {
      await this.noteTagsDatabaseService.updateTags(noteId, noteUpdate.tags);
    }

    return this.get(noteId);
  }

  async delete(noteId: string): Promise<void> {
    const sql = await this.databaseService.getSQL();

    let result: RowList<Row[]>;
    try {
      result = await sql`DELETE FROM notes WHERE id = ${noteId}`;
    }
    catch (e: any) {
      throw NotesDatabaseService.getDatabaseError(e);
    }

    // If there's a count then rows were affected and the deletion was a success
    // If there's no count but an error wasn't thrown then the entity must not exist
    if (result && result.count) {
      return;
    }
    else {
      throw new ResourceNotFoundError({
        applicationMessage: "The requested note could not be found."
      })
    }
  }

  async list(vaultId: string, options: ListOptions): Promise<NoteDto[]> {
    const sql = await this.databaseService.getSQL();

    // todo: this assumes that options.orderBy/options.orderDirection will always be validated etc
    let results: DatabaseNoteDto[] = [];
    try {
      results = await sql<DatabaseNoteDto[]>`SELECT * FROM notes WHERE vault = ${vaultId} ORDER BY ${sql(options.orderBy)} ${options.orderDirection === "ASC" ? sql`ASC` : sql`DESC` } LIMIT ${options.take} OFFSET ${options.skip}`;
    }
    catch (e: any) {
      throw new SystemError({
        message: "Unexpected error while fetching notes",
        originalError: e
      })
    }

    const notes: NoteDto[] = [];
    for (const resultNote of results) {
      const tags = await this.noteTagsDatabaseService.getTags(resultNote.id);

      notes.push({
        ...NotesDatabaseService.convertDatabaseDtoToDto(resultNote),
        tags
      });
    }
    return notes;
  }

  async getListMetadata(vaultId: string, options: ListOptions): Promise<MetaPaginationData> {
    const sql = await this.databaseService.getSQL();

    // todo: this assumes that options.orderBy/options.orderDirection will always be validated etc
    try {
      // Offset and order don't matter for fetching the total count, so we can ignore these for the query.
      const result = await sql`SELECT count(*) FROM notes WHERE vault = ${vaultId}`;
      return {
        total: parseInt(result[0].count),
        take: options.take,
        skip: options.skip,
      };
    }
    catch (e: any) {
      throw new SystemError({
        message: "Unexpected error while fetching note list metadata",
        originalError: e
      })
    }
  }
}