import {z} from "zod";
import {VIEWS} from "../types.ts";
import {BaseViewData} from "./base.ts";

export const CanvasViewData = BaseViewData.extend({
	type: z.literal(VIEWS.canvas.id),
	settings: z.literal(null)
}).strict()
export type CanvasViewData = z.infer<typeof CanvasViewData>
