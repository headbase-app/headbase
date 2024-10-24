import {ReportFunction} from "./performance-manager";
import {LocalfulWeb} from "@headbase-toolkit/localful-web";
import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../state/headbase-localful";
import {EntityDatabase} from "@headbase-toolkit/storage/entity-database/entity-database";

const SHORT_STRING = "Chapter - Firstname lastname"
const TAG_NUMBER = 600
const TAG_VERSIONS_NUMBER = 20

export async function runTest(report: ReportFunction) {
	const localful = new LocalfulWeb<HeadbaseTableTypes, HeadbaseTableSchemas>({tableSchemas: HeadbaseTableSchemas})

	const password = 'password1234'
	const databaseId = await localful.createDatabase({name: 'perf test', syncEnabled: 0}, password)
	await localful.unlockDatabase(databaseId, password)
	const currentDatabase = await localful.openDatabase(databaseId)
	if (!currentDatabase) throw new Error('unexpected error')

	const benchmarkStartTime = performance.now()

	report({level: "section", text: "Setup"})
	report({level: "message", text: `Created test database ${databaseId}`})

	await createTestData(currentDatabase, report)
	await queryTestData(currentDatabase, report)

	report({level: "section", text: "Teardown"})
	await currentDatabase.close()
	await localful.deleteDatabase(databaseId)
	report({level: "message", text: "deleted database vault"})

	const benchmarkEndTime = performance.now()
	report({level: "section", text: "Final Report"})
	report({level: "message", text: `Full benchmark ran in ${benchmarkEndTime - benchmarkStartTime}ms`})
}

export async function createTestData(currentDatabase: EntityDatabase<HeadbaseTableTypes, HeadbaseTableSchemas>, report: ReportFunction) {
	report({level: "section", text: "Tags"})
	report({level: "task", text: "Creating Tags"})
	const tagCreationStart = performance.now()
	for (let i = 1; i <= TAG_NUMBER; i++) {
		const tagId = await currentDatabase.create('tags', {name: SHORT_STRING, colourVariant: "purple"})
		for (let j = 1; j <= TAG_VERSIONS_NUMBER; j++) {
			await currentDatabase.update('tags', tagId, {name: SHORT_STRING, colourVariant: "purple"})
		}
	}
	const tagCreationEnd = performance.now()
	report({level: "message", text: `created ${TAG_NUMBER} tags, with ${TAG_VERSIONS_NUMBER} versions each in ${tagCreationEnd - tagCreationStart}ms`})
}

export async function queryTestData(currentDatabase: EntityDatabase<HeadbaseTableTypes, HeadbaseTableSchemas>, report: ReportFunction) {
	report({level: "task", text: "Fetching Tags"})
	const getTagsStart = performance.now()
	const tagsQuery = await currentDatabase.query({table: 'tags'})
	const getTagsEnd = performance.now()
	report({level: "message", text: `fetched all tags in ${getTagsEnd - getTagsStart}ms`})

	// report({level: "task", text: "Fetching Tags Again (from memory cache)"})
	// const getTagsRetryStart = performance.now()
	// await perfDb.tagQueries.getAll()
	// if (!tags.success) throw tags
	// const getTagsRetryEnd = performance.now()
	// report({level: "message", text: `fetched all tag in ${getTagsRetryEnd - getTagsRetryStart}ms`})

	report({level: "task", text: "Fetching Single Tag"})
	const tagId = tagsQuery.result[10].id
	const getTagStart = performance.now()
	await currentDatabase.get('tags', tagId)
	const getTagEnd = performance.now()
	report({level: "message", text: `fetched single tag in ${getTagEnd - getTagStart}ms`})

	// report({level: "task", text: "Fetching Single Tag Again (from memory cache)"})
	// const getTagRetryStart = performance.now()
	// await perfDb.tagQueries.get(tagId)
	// const getTagRetryEnd = performance.now()
	// report({level: "message", text: `fetched single tag in ${getTagRetryEnd - getTagRetryStart}ms`})

	report({level: "task", text: "Updating Tag"})
	const updateTagId = tagsQuery.result[20].id
	const updateTagStart = performance.now()
	await currentDatabase.update('tags', updateTagId, {name: SHORT_STRING})
	const updateTagEnd = performance.now()
	report({level: "message", text: `updated tag in ${updateTagEnd - updateTagStart}ms`})

	report({level: "task", text: "Deleting Tag"})
	const deleteTagId = tagsQuery.result[15].id
	const deleteTagStart = performance.now()
	await currentDatabase.delete('tags', deleteTagId)
	const deleteTagEnd = performance.now()
	report({level: "message", text: `deleted tag in ${deleteTagEnd - deleteTagStart}ms`})
}
