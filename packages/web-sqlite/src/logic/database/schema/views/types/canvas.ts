import {z} from "zod";
import {VIEWS} from "../types.ts";
import {BaseViewData} from "../dtos.ts";

export const CanvasViewData = BaseViewData.extend({
	type: z.literal(VIEWS.canvas.id),
}).strict()
export type CanvasViewData = z.infer<typeof CanvasViewData>
