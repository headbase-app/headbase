import {ListViewData} from "./types/list.ts";
import {KanbanViewData} from "./types/kanban.ts";
import {TableViewData} from "./types/table.ts";
import {CalendarViewData} from "./types/calendar.ts";
import {CanvasViewData} from "./types/canvas.ts";

export const VIEWS = {
	list: {
		label: "List",
		id: "list",
	},
	kanban: {
		label: "Kanban",
		id: "kanban",
	},
	table: {
		label: "Table",
		id: "table",
	},
	calendar: {
		label: "Calendar",
		id: "calendar",
	},
	canvas: {
		label: "Canvas",
		id: "canvas",
	},
} as const

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

export const ViewTypes = [
	VIEWS.list.id,
	VIEWS.kanban.id,
	VIEWS.table.id,
	VIEWS.calendar.id,
	VIEWS.canvas.id,
] as const
export type ViewTypes = keyof typeof VIEWS
