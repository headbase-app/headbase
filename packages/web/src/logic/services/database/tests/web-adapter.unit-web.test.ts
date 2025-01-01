import {test} from "vitest";
import {WebDatabaseService} from "../web-database.service.ts";
import {DeviceContext} from "../../interfaces.ts";
import {DatabaseTransactions} from "../database-transactions.ts";
import {WebEventsService} from "../../events/web-events.service.ts";


test("should set up fine", async ({expect}) => {
	const testContext: DeviceContext = {id: "5a9a690d-03b8-41ea-a67e-db81907b87e2", name: "test-setup"}
	const testDatabaseId = "40d68de2-884a-4ddc-bdb8-f5bdf9737a5e"
	const testEncryptionKey = 'v1.abde2e79b4fe8323e277b1b3375f414452440bee1d94233ba003935b3bf1b63c'

	const eventService = new WebEventsService({context: testContext})
	const databaseService = new WebDatabaseService({context: testContext})
	const database = new DatabaseTransactions({context: testContext}, eventService, databaseService)
	await database.open(testDatabaseId, testEncryptionKey)

	const newField = await database.createField({
		type: "markdown",
		name: "testing",
		createdBy: "test-setup",
		settings: {
			defaultLines: 5,
		},
	})
	const fetchedField = await database.getField(newField.id)

	expect(fetchedField).toEqual(expect.objectContaining({
		id: expect.any(String),
		createdAt: expect.any(String),
		updatedAt: expect.any(String),
		versionId: expect.any(String),
		versionCreatedBy: "test-setup",
		previousVersionId: null,
		isDeleted: false,
		type: "markdown",
		name: "testing",
		icon: null,
		description: null,
		settings: expect.objectContaining({
			defaultLines: 5,
		})
	}))
})
