import {z} from "zod";

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
	return []
}
