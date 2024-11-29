
export interface SQLite3 {
	capi: {
		sqlite3_vfs_find: any
		sqlite3_js_db_export: any
	}
	oo1: {
		OpfsDb: any
	}
}

export interface SQLite3Database {
	exec: any
	close: any
}