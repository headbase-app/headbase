import {z} from "zod";
import {BaseCreateDto, BaseEntityDto, BaseVersionDto} from "../common/dto.ts";
import {ListViewData} from "./types/list.ts";
import {KanbanViewData} from "./types/kanban.ts";
import {TableViewData} from "./types/table.ts";
import {CalendarViewData} from "./types/calendar.ts";
import {CanvasViewData} from "./types/canvas.ts";

export const CreateViewDto = z.union([
	BaseCreateDto.merge(ListViewData),
	BaseCreateDto.merge(KanbanViewData),
	BaseCreateDto.merge(TableViewData),
	BaseCreateDto.merge(CalendarViewData),
	BaseCreateDto.merge(CanvasViewData)
])
export type CreateViewDto = z.infer<typeof CreateViewDto>

export const UpdateViewDto = CreateViewDto
export type UpdateViewDto = CreateViewDto

export const ViewDto = z.union([
	BaseEntityDto.merge(ListViewData),
	BaseEntityDto.merge(KanbanViewData),
	BaseEntityDto.merge(TableViewData),
	BaseEntityDto.merge(CalendarViewData),
	BaseEntityDto.merge(CanvasViewData)
])
export type ViewDto = z.infer<typeof ViewDto>

export const ViewVersionDto = z.union([
	BaseVersionDto.merge(ListViewData),
	BaseVersionDto.merge(KanbanViewData),
	BaseVersionDto.merge(TableViewData),
	BaseVersionDto.merge(CalendarViewData),
	BaseVersionDto.merge(CanvasViewData)
])
export type ViewVersionDto = z.infer<typeof ViewVersionDto>
