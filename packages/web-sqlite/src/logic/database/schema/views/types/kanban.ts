import {z} from "zod";
import {VIEWS} from "../types.ts";
import {BaseViewData} from "./base.ts";

export const KanbanViewData = BaseViewData.extend({
	type: z.literal(VIEWS.kanban.id),
	settings: z.literal(null)
}).strict()
export type KanbanViewData = z.infer<typeof KanbanViewData>
