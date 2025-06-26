import {ReportFunction} from "./performance-manager";
import {HeadbaseWeb} from "../../../logic/headbase-web.ts";


const SHORT_STRING = "Chapter - Firstname lastname"
const TAG_NUMBER = 600
const TAG_VERSIONS_NUMBER = 20

export async function runTest(headbase: HeadbaseWeb, report: ReportFunction) {

	// const password = 'password1234'
	// const databaseId = await headbase.vaults.create({name: 'perf test', syncEnabled: 0, password})
	// await headbase.vaults.unlock(databaseId, password)
	//
	// const benchmarkStartTime = performance.now()
	//
	// report({level: "section", text: "Setup"})
	// report({level: "message", text: `Created test database ${databaseId}`})
	//
	// await createTestData(databaseId, headbase, report)
	// await queryTestData(databaseId, headbase, report)
	//
	// report({level: "section", text: "Teardown"})
	// await headbase.db.close()
	// await headbase.vaults.delete(databaseId)
	// report({level: "message", text: "deleted database vault"})
	//
	// const benchmarkEndTime = performance.now()
	// report({level: "section", text: "Final Report"})
	// report({level: "message", text: `Full benchmark ran in ${benchmarkEndTime - benchmarkStartTime}ms`})
}

export async function createTestData(currentDatabaseId: string, headbase: HeadbaseWeb, report: ReportFunction) {
	// report({level: "section", text: "Tags"})
	// report({level: "task", text: "Creating Tags"})
	// const tagCreationStart = performance.now()
	// for (let i = 1; i <= TAG_NUMBER; i++) {
	// 	const tagId = await headbase.tx.create(currentDatabaseId, 'tags', {name: SHORT_STRING, colourVariant: "purple"})
	// 	for (let j = 1; j <= TAG_VERSIONS_NUMBER; j++) {
	// 		await headbase.tx.update(currentDatabaseId, 'tags', tagId, {name: SHORT_STRING, colourVariant: "purple"})
	// 	}
	// }
	// const tagCreationEnd = performance.now()
	// report({level: "message", text: `created ${TAG_NUMBER} tags, with ${TAG_VERSIONS_NUMBER} versions each in ${tagCreationEnd - tagCreationStart}ms`})
}

export async function queryTestData(currentDatabaseId: string, headbase: HeadbaseWeb, report: ReportFunction) {
	// report({level: "task", text: "Fetching Tags"})
	// const getTagsStart = performance.now()
	// const tagsQuery = await headbase.tx.query(currentDatabaseId, {table: 'tags'})
	// const getTagsEnd = performance.now()
	// report({level: "message", text: `fetched all tags in ${getTagsEnd - getTagsStart}ms`})
	//
	// // report({level: "task", text: "Fetching Tags Again (from memory cache)"})
	// // const getTagsRetryStart = performance.now()
	// // await perfDb.tagQueries.getAll()
	// // if (!tags.success) throw tags
	// // const getTagsRetryEnd = performance.now()
	// // report({level: "message", text: `fetched all tag in ${getTagsRetryEnd - getTagsRetryStart}ms`})
	//
	// report({level: "task", text: "Fetching Single Tag"})
	// const tagId = tagsQuery.result[10].id
	// const getTagStart = performance.now()
	// await headbase.tx.get(currentDatabaseId, 'tags', tagId)
	// const getTagEnd = performance.now()
	// report({level: "message", text: `fetched single tag in ${getTagEnd - getTagStart}ms`})
	//
	// // report({level: "task", text: "Fetching Single Tag Again (from memory cache)"})
	// // const getTagRetryStart = performance.now()
	// // await perfDb.tagQueries.get(tagId)
	// // const getTagRetryEnd = performance.now()
	// // report({level: "message", text: `fetched single tag in ${getTagRetryEnd - getTagRetryStart}ms`})
	//
	// report({level: "task", text: "Updating Tag"})
	// const updateTagId = tagsQuery.result[20].id
	// const updateTagStart = performance.now()
	// await headbase.tx.update(currentDatabaseId, 'tags', updateTagId, {name: SHORT_STRING})
	// const updateTagEnd = performance.now()
	// report({level: "message", text: `updated tag in ${updateTagEnd - updateTagStart}ms`})
	//
	// report({level: "task", text: "Deleting Tag"})
	// const deleteTagId = tagsQuery.result[15].id
	// const deleteTagStart = performance.now()
	// await headbase.tx.delete(currentDatabaseId, 'tags', deleteTagId)
	// const deleteTagEnd = performance.now()
	// report({level: "message", text: `deleted tag in ${deleteTagEnd - deleteTagStart}ms`})
}
