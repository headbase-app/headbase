import {ListViewData} from "./types/list.ts";
import {KanbanViewData} from "./types/kanban.ts";
import {TableViewData} from "./types/table.ts";
import {CalendarViewData} from "./types/calendar.ts";
import {CanvasViewData} from "./types/canvas.ts";

export const VIEWS_SCHEMAS =  {
	list: {
		settings: ListViewData,
	},
	kanban: {
		settings: KanbanViewData,
	},
	table: {
		settings: TableViewData,
	},
	calendar: {
		settings: CalendarViewData,
	},
	canvas: {
		settings: CanvasViewData,
	},
} as const
