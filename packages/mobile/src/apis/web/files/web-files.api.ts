import {
	type IFilesAPI,
	type IFileSystemItem,
	type IFileSystemTree, type IFileSystemTreeItem,
	LIVE_QUERY_LOADING_STATE,
	type LiveQueryResult
} from "@headbase-app/libweb";
import * as opfxs from "opfsx"
import type {OPFSXDirectoryTree, OPFSXFile} from "opfsx";
import {Observable} from "rxjs";

// @ts-ignore --- added for debugging
window.opfsx = opfxs

export class WebFilesAPI implements IFilesAPI {
	isVaultLocationSelectable(): boolean {
		return false;
	}

	async selectVaultLocation(): Promise<string|null> {
		throw new Error("Selecting vault location is not supported on the web platform.")
	}

	async checkPermissions(): Promise<boolean> {
		return true;
	}
	async requestPermissions(): Promise<boolean> {
		return true
	}

	getPathDisplay(path: string) {
		return path.replace("/headbase-v1/vaults/", "")
	}

	getFileName(path: string): string {
		const parts = path.split("/")
		return parts[parts.length-1]
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
		try {
			const tree = await opfxs.tree(path)
			return {
				name: this.getFileName(path),
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
			name: this.getFileName(path),
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
		const file = await opfxs.read(path)
		const buffer = await file.arrayBuffer()
		return new Uint8Array(buffer)
	}
	async readAsText(path: string): Promise<string> {
		const file = await opfxs.read(path)
		return await file.text()
	}
	async readAsUrl(path: string): Promise<string> {
		const file = await opfxs.read(path)
		const buffer = await file.arrayBuffer()
		const blob = new Blob([buffer])
		return URL.createObjectURL(blob)
	}

	async write(path: string, data: ArrayBuffer | Uint8Array) {}

	async writeText(path: string, data: string) {
		await opfxs.write(path, data)
	}

	liveTree(path: string){
		return new Observable<LiveQueryResult<IFileSystemTree>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)
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

