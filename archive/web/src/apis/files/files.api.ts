import * as opfsx from "opfsx"
import type {OPFSXDirectoryTree, OPFSXFile} from "opfsx";
import {Observable} from "rxjs";

import {
	EventTypes, type IEventsService,
	type IFilesAPI,
	type IFileSystemItem,
	type IFileSystemTree, type IFileSystemTreeItem,
	LIVE_QUERY_LOADING_STATE,
	type LiveQueryResult, LiveQueryStatus
} from "../../../../lib/dist";
import {ParsedPath} from "@headbase-app/desktop/lib";


export class FilesAPI implements IFilesAPI {
	constructor(
		private eventsService: IEventsService
	) {
		// @ts-ignore -- added to window debugging. todo: remove once more stable.
		window.opfsx = opfsx
	}

	parsePath(path: string): ParsedPath  {
		// todo: may not work across posix/windows?
		const parts = path.split("/");
		const base = parts[parts.length - 1]

		const dir = parts.slice(0, parts.length - 1).join("")

		const extParts = base.split(".")
		const ext = extParts.slice(0, extParts.length - 1).join(".");

		return {
			base: base,
			dir: dir,
			ext: ext,
		}
	}

	async ls() {
		return []
	}

	/**
	 * Map the tree data structure returned by OPFSX to the Headbase type IFileSystemTreeItem.
	 */
	#mapTreeItem(treeItem: OPFSXDirectoryTree|OPFSXFile): IFileSystemTreeItem {
		if (treeItem.kind === "file") {
			return {
				type: "file",
				name: treeItem.name,
				path: treeItem.path,
			}
		}

		return {
			type: "directory",
			name: treeItem.name,
			path: treeItem.path,
			children: treeItem.children.map(this.#mapTreeItem.bind(this))
		}
	}

	async tree(path: string): Promise<IFileSystemTree> {
		const parsedPath = this.parsePath()
		try {
			const tree = await opfsx.tree(path)
			return {
				name: parsedPath.base,
				path,
				type: "directory",
				children: tree.children.map(this.#mapTreeItem.bind(this))
			}
		}
		catch (e) {
			console.warn("Called WebFilesAPI.tree and directory wasn't found, returning fake empty dir", e)
		}

		// fallback to returning an empty directory if there's been an error.
		return {
			name: parsedPath.base,
			path: path,
			type: "directory",
			children: []
		}
	}

	async mv(sourcePath: string, destinationPath: string) {}

	async cp(sourcePath: string, destinationPath: string) {}

	async rm(path: string) {}

	async mkdir(path: string) {}

	async read(path: string): Promise<Uint8Array> {
		const file = await opfsx.read(path)
		const buffer = await file.arrayBuffer()
		return new Uint8Array(buffer)
	}
	async readAsText(path: string): Promise<string> {
		const file = await opfsx.read(path)
		return await file.text()
	}
	async readAsUrl(path: string): Promise<string> {
		const file = await opfsx.read(path)
		const buffer = await file.arrayBuffer()
		const blob = new Blob([buffer])
		return URL.createObjectURL(blob)
	}

	async write(path: string, data: ArrayBuffer | Uint8Array) {}

	async writeText(path: string, data: string) {
		await opfsx.write(path, data)
	}

	liveTree(path: string){
		return new Observable<LiveQueryResult<IFileSystemTree | null>>((observer) => {
			const runQuery = async () => {
				observer.next({status: LiveQueryStatus.LOADING, result: null})

				try {
					const tree = await this.tree(path)
					observer.next({status: LiveQueryStatus.SUCCESS, result: tree })
				}
				catch (error) {
					observer.next({status: LiveQueryStatus.ERROR, errors: [error], result: null })
				}
			}

			this.eventsService.subscribe(EventTypes.FILE_CHANGE, runQuery)
			runQuery()

			return () => {
				this.eventsService.unsubscribe(EventTypes.FILE_CHANGE, runQuery)
			}
		})
	}

	liveLs(path: string) {
		return new Observable<LiveQueryResult<IFileSystemItem[]>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)
		})
	}

	liveRead(path: string) {
		return new Observable<LiveQueryResult<string>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)
		})
	}
}

