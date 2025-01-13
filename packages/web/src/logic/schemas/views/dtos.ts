import {z} from "zod";
import {BaseCreateDto, BaseEntityDto, BaseUpdateDto, BaseVersionDto} from "../common/dto.ts";
import {ListViewData} from "./types/list.ts";
import {KanbanViewData} from "./types/kanban.ts";
import {TableViewData} from "./types/table.ts";
import {CalendarViewData} from "./types/calendar.ts";
import {CanvasViewData} from "./types/canvas.ts";

export const CreateViewDto = z.discriminatedUnion("type", [
	BaseCreateDto.merge(ListViewData),
	BaseCreateDto.merge(KanbanViewData),
	BaseCreateDto.merge(TableViewData),
	BaseCreateDto.merge(CalendarViewData),
	BaseCreateDto.merge(CanvasViewData)
])
export type CreateViewDto = z.infer<typeof CreateViewDto>

export const UpdateViewDto = z.discriminatedUnion("type", [
	BaseUpdateDto.merge(ListViewData),
	BaseUpdateDto.merge(KanbanViewData),
	BaseUpdateDto.merge(TableViewData),
	BaseUpdateDto.merge(CalendarViewData),
	BaseUpdateDto.merge(CanvasViewData)
])
export type UpdateViewDto = z.infer<typeof UpdateViewDto>

export const ViewDto = z.discriminatedUnion("type", [
	BaseEntityDto.merge(ListViewData),
	BaseEntityDto.merge(KanbanViewData),
	BaseEntityDto.merge(TableViewData),
	BaseEntityDto.merge(CalendarViewData),
	BaseEntityDto.merge(CanvasViewData)
])
export type ViewDto = z.infer<typeof ViewDto>

export const ViewVersionDto = z.discriminatedUnion("type", [
	BaseVersionDto.merge(ListViewData),
	BaseVersionDto.merge(KanbanViewData),
	BaseVersionDto.merge(TableViewData),
	BaseVersionDto.merge(CalendarViewData),
	BaseVersionDto.merge(CanvasViewData)
])
export type ViewVersionDto = z.infer<typeof ViewVersionDto>
