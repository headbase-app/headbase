import {FilesService} from "../files.service.ts";
import {EventsService} from "../../events/events.service.ts";
import {DeviceContext} from "../../../interfaces.ts";
import {afterEach, beforeEach, describe, test} from "vitest";
import {filesHistory, LocalFileVersion} from "../schema.ts";

const DEVICE_CONTEXT: DeviceContext = {id: "a2951fac-bf37-460a-952f-72439d4b6098"}
const VAULT_ID = "470c999c-f93f-412a-b0d4-995ba2cd9dad"

const eventsService = new EventsService({context: DEVICE_CONTEXT})

const filesService = new FilesService(
	{context: {id: "a2951fac-bf37-460a-952f-72439d4b6098"}},
	eventsService
);

async function deleteHistory() {
	const db = await filesService._getDatabase(VAULT_ID)
	await db.delete(filesHistory)
}

beforeEach(deleteHistory)
afterEach(deleteHistory)

const EXAMPLE_VERSIONS: LocalFileVersion[] = [
	// /home.md - initial creation and one edit
	{
		id: "homev1", previousVersionId: null, fileId: "home", parentId: null,
		name: "home.md", originalPath: "/home.md", contentHash: "", isDirectory: false, type: "md",
		createdAt: "2025-07-01T13:50:57.000Z", createdBy: "testing1", deletedAt: null
	},
	{
		id: "homev2", previousVersionId: "homev2", fileId: "home", parentId: null,
		name: "home.md", originalPath: "/home.md", contentHash: "", isDirectory: false, type: "md",
		createdAt: "2025-07-01T13:55:33.000Z", createdBy: "testing1", deletedAt: null
	},

	// /temp.md - initial creation, one edit, then deleted
	{
		id: "tempv1", previousVersionId: null, fileId: "temp", parentId: null,
		name: "home.md", originalPath: "/home.md", contentHash: "", isDirectory: false, type: "md",
		createdAt: "2025-07-01T13:50:57.000Z", createdBy: "testing1", deletedAt: "2025-07-02T19:40:46.000Z"
	},
	{
		id: "tempv2", previousVersionId: "tempv1", fileId: "temp", parentId: null,
		name: "home.md", originalPath: "/home.md", contentHash: "", isDirectory: false, type: "md",
		createdAt: "2025-07-01T13:55:33.000Z", createdBy: "testing1", deletedAt: "2025-07-02T19:40:46.000Z"
	},

	// /notes - initial creation as notes-temp then rename to notes
	{
		id: "notesv1", previousVersionId: null, fileId: "notes", parentId: null,
		name: "notes-temp", originalPath: "/notes-temp", contentHash: "", isDirectory: true, type: "",
		createdAt: "2025-07-02T19:42:05.000Z", createdBy: "testing1", deletedAt: null
	},
	{
		id: "notesv1", previousVersionId: "notesv1", fileId: "notes", parentId: null,
		name: "notes", originalPath: "/notes", contentHash: "", isDirectory: true, type: "",
		createdAt: "2025-07-02T19:42:05.000Z", createdBy: "testing1", deletedAt: null
	},

	// /notes/notes1.md - initial creation
	{
		id: "note1v1", previousVersionId: null, fileId: "note1", parentId: "notes",
		name: "note1.md", originalPath: "/notes/note1.md", contentHash: "", isDirectory: false, type: "md",
		createdAt: "2025-07-02T19:42:05.000Z", createdBy: "testing1", deletedAt: null
	},

	// /notes/notes2.md - initial creation
	{
		id: "notes2v1", previousVersionId: null, fileId: "note2", parentId: "notes",
		name: "notes2.md", originalPath: "/notes/notes2.md", contentHash: "", isDirectory: false, type: "md",
		createdAt: "2025-07-02T19:42:05.000Z", createdBy: "testing1", deletedAt: null
	},

	// /notes/notes3.md - initial creation as notes3-temp.md then rename
	{
		id: "notes2v1", previousVersionId: null, fileId: "note2", parentId: "notes",
		name: "notes2.md", originalPath: "/notes/notes2.md", contentHash: "", isDirectory: false, type: "md",
		createdAt: "2025-07-02T19:42:05.000Z", createdBy: "testing1", deletedAt: null
	},
]

describe("can extract file cache from versions", async () => {
	for (const version of EXAMPLE_VERSIONS) {
		await filesService.create(VAULT_ID, version)
	}
	const tree = await filesService.getFileCache(VAULT_ID)
})
