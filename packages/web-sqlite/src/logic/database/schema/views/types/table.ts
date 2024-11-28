import {z} from "zod";
import {VIEWS} from "../types.ts";
import {BaseViewData} from "./base.ts";

export const TableViewData = BaseViewData.extend({
	type: z.literal(VIEWS.table.id),
}).strict()
export type TableViewData = z.infer<typeof TableViewData>
