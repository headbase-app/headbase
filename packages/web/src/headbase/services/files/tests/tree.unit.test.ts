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

describe("can extract file tree from versions", async () => {
	const versions: LocalFileVersion[] = [
		// home.md - initial creation and one edit
		{
			id: "homev1", previousVersionId: null, fileId: "home", parentId: null,
			name: "home.md", originalPath: "/home.md", isDirectory: false, type: "md",
			createdAt: "2025-07-01T13:50:57.000Z", createdBy: "testing1", deletedAt: null
		},
		{
			id: "homev2", previousVersionId: "homev2", fileId: "home", parentId: null,
			name: "home.md", originalPath: "/home.md", isDirectory: false, type: "md",
			createdAt: "2025-07-01T13:55:33.000Z", createdBy: "testing1", deletedAt: null
		},

		// temp.md - initial creation, one edit, then deleted
		{
			id: "tempv1", previousVersionId: null, fileId: "temp", parentId: null,
			name: "home.md", originalPath: "/home.md", isDirectory: false, type: "md",
			createdAt: "2025-07-01T13:50:57.000Z", createdBy: "testing1", deletedAt: null
		},
		{
			id: "tempv2", previousVersionId: "tempv1", fileId: "temp", parentId: null,
			name: "home.md", originalPath: "/home.md", isDirectory: false, type: "md",
			createdAt: "2025-07-01T13:55:33.000Z", createdBy: "testing1", deletedAt: null
		}
	]
})
