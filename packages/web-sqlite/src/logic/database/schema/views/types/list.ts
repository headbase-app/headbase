import {z} from "zod";
import {VIEWS} from "../types.ts";
import {BaseViewData} from "./base.ts";

export const ListViewData = BaseViewData.extend({
	type: z.literal(VIEWS.list.id),
	settings: z.literal(null)
}).strict()
export type ListViewData = z.infer<typeof ListViewData>
