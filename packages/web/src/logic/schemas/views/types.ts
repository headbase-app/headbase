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

export const ViewTypes = [
	VIEWS.list.id,
	VIEWS.kanban.id,
	VIEWS.table.id,
	VIEWS.calendar.id,
	VIEWS.canvas.id,
] as const
export type ViewTypes = keyof typeof VIEWS
