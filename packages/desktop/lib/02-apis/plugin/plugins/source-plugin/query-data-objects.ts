import { jsonquery } from "@jsonquerylang/jsonquery";
import {z} from "zod";

// export type Data = string | number | boolean | null | undefined
// export type DataFields = {
// 	[key: string]: Data | Data[] | DataFields
// }
// export type FieldKey = "$file.name" | "$file.path" | "$file.text" | string
// export type WhereQuery = {
// 	[field: FieldKey]: {
// 		$equal?: string | number | boolean
// 		$notEqual?: string | number | boolean
// 		$contains?: string | number
// 		$notContains?: string | number
// 		$in?: string[] | number[]
// 		$notIn?: string[] | number[]
// 		$less?: string | number
// 		$lessEqual?: string | number
// 		$greater?: string | number
// 		$greaterEqual?: string | number
// 		$and?: WhereQuery[]
// 		$or?: WhereQuery[]
// 	}
// } & {
// 	$and?: WhereQuery[]
// 	$or?: WhereQuery[]
// }
//
// // todo: add ability to page results?
// export interface DataQuery {
// 	order?: {
// 		[field: FieldKey]: 'desc' | 'asc'
// 	}
// 	where?: WhereQuery
// }

export const DataObject = z.object({
	$file: z.object({
		name: z.string(),
		path: z.string(),
		text: z.string().nullish(),
	}).strict()
})
export type DataObject = z.infer<typeof DataObject>

export const DataObjectArray = z.array(DataObject)
export type DataObjectArray = z.infer<typeof DataObjectArray>

export function queryDataObjects(query: string, data: DataObject[]) {
	let results: DataObject[]
	try {
		results = jsonquery(data, query) as DataObject[];
	}
	catch (e) {
		throw new Error("Error while executing query.", {cause: e});
	}

	const isResultsValid = DataObjectArray.safeParse(results)
	if (!isResultsValid.success) {
		console.error(isResultsValid.error)
		throw new Error("Query must return an array of data objects, retaining the $file property.");
	}

	return results
}
