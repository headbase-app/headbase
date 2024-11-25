import {z} from "zod";
import {VIEWS} from "../types.ts";
import {BaseViewData} from "../dtos.ts";

export const ListViewData = BaseViewData.extend({
	type: z.literal(VIEWS.list.id),
}).strict()
export type ListViewData = z.infer<typeof ListViewData>
