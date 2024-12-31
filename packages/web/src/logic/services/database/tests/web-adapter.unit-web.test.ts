import {test} from "vitest";
import {WebPlatformAdapter} from "../web-adapter/web-adapter.ts";
import {DeviceContext} from "../adapter.ts";
import {Database} from "../database.ts";


test("should set up fine", async ({expect}) => {
	const testContext: DeviceContext = {id: "5a9a690d-03b8-41ea-a67e-db81907b87e2", name: "test-setup"}
	const testDatabaseId = "40d68de2-884a-4ddc-bdb8-f5bdf9737a5e"
	const testEncryptionKey = 'v1.abde2e79b4fe8323e277b1b3375f414452440bee1d94233ba003935b3bf1b63c'

	const webPlatformAdapter = new WebPlatformAdapter({context: testContext})
	const database = new Database({context: testContext, platformAdapter: webPlatformAdapter})
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
		type: "markdown",
		name: "testing",
		createdBy: "test-setup",
		settings: expect.objectContaining({
			defaultLines: 5,
		})
	}))
})
