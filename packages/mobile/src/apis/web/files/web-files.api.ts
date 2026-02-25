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

	getPathName(path: string) {
		const parts = path.split("/")
		return parts[parts.length-1]
	}

	async ls() {
		return []
	}

	#mapOPFSXItem(treeItem: OPFSXDirectoryTree|OPFSXFile): IFileSystemTreeItem {
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
			children: treeItem.children.map(this.#mapOPFSXItem.bind(this))
		}
	}

	async tree(path: string): Promise<IFileSystemTree> {
		try {
			const tree = await opfxs.tree(path)
			return {
				name: this.getPathName(path),
				path,
				type: "directory",
				children: tree.children.map(this.#mapOPFSXItem.bind(this))
			}
		}
		catch (e) {
			console.warn("Called WebFilesAPI.tree and directory wasn't found, returning fake empty dir", e)
		}

		return {
			name: this.getPathName(path),
			path: path,
			type: "directory",
			children: []
		}
	}

	// @ts-ignore
	async mv(sourcePath: string, destinationPath: string) {}

	// @ts-ignore
	async cp(sourcePath: string, destinationPath: string) {}

	// @ts-ignore
	async rm(path: string) {}

	// @ts-ignore
	async mkdir(path: string) {}

	// @ts-ignore
	async read(path: string): Promise<string> {}

	// @ts-ignore
	async write(path: string, data: string | ArrayBuffer | Uint8Array) {}

	// @ts-ignore
	liveTree(path: string){
		return new Observable<LiveQueryResult<IFileSystemTree>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)
		})
	}

	// @ts-ignore
	liveLs(path: string) {
		return new Observable<LiveQueryResult<IFileSystemItem[]>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)
		})
	}

	// @ts-ignore
	liveRead(path: string) {
		return new Observable<LiveQueryResult<string>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)
		})
	}
}

