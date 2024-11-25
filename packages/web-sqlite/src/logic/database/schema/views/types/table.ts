import {z} from "zod";
import {VIEWS} from "../types.ts";
import {BaseViewData} from "../dtos.ts";

export const TableViewData = BaseViewData.extend({
	type: z.literal(VIEWS.table.id),
}).strict()
export type TableViewData = z.infer<typeof TableViewData>
