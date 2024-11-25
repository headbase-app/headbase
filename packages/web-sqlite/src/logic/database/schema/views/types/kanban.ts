import {z} from "zod";
import {VIEWS} from "../types.ts";
import {BaseViewData} from "../dtos.ts";

export const KanbanViewData = BaseViewData.extend({
	type: z.literal(VIEWS.kanban.id),
}).strict()
export type KanbanViewData = z.infer<typeof KanbanViewData>
