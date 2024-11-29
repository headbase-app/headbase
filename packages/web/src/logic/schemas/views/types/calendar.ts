import {z} from "zod";
import {VIEWS} from "../types.ts";
import {BaseViewData} from "./base.ts";

export const CalendarViewData = BaseViewData.extend({
	type: z.literal(VIEWS.calendar.id),
	settings: z.literal(null)
}).strict()
export type CalendarViewData = z.infer<typeof CalendarViewData>
