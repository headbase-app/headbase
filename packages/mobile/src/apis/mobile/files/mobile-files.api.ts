import {Capacitor} from "@capacitor/core";
import {Filesystem} from "@capacitor/filesystem";
import {Observable} from "rxjs";

import {
	type IFilesAPI,
	type IFileSystemItem,
	type IFileSystemTree, type IFileSystemTreeItem,
	LIVE_QUERY_LOADING_STATE,
	type LiveQueryResult
} from "@headbase-app/libweb";

import {HeadbaseFileSystem} from "../../../../native/plugins/headbase-filesystem.ts";


export class MobileFilesAPI implements IFilesAPI {
	getPathDisplay(path: string) {
		if (Capacitor.getPlatform() === "android") {
			if (path.startsWith("/storage/emulated/0/")){
				return path.replace("/storage/emulated/0/", "/")
			}
		}
		return path
	}

	getPathName(path: string) {
		const parts = path.split("/")
		return parts[parts.length-1]
	}

	isVaultLocationSelectable(): boolean {
		return true;
	}

	async selectVaultLocation(): Promise<string|null> {
		try {
			// todo: handle user cancellation with specific return?
			// todo: handle locations such as DocumentProviders?
			const result = await HeadbaseFileSystem.pickDirectory()
			return result.value
		}
		catch (e) {
			console.warn("FilePicker.pickDirectory threw error, assuming cancelled by user.", e)
		}
		return null;
	}

	async checkPermissions(): Promise<boolean> {
		const result = await HeadbaseFileSystem.isManageExternalStorageGranted()
		return result.value
	}

	async requestPermissions(): Promise<boolean> {
		const result = await HeadbaseFileSystem.requestManageExternalStorage()
		return result.value
	}

	/**
	 * Return a nested tree structure of all files/directories from the given source.
	 *
	 * @param path
	 */
	async tree(path: string): Promise<IFileSystemTree> {
		return this.#tree(path, path)
	}
	async #tree(path: string, name?: string): Promise<IFileSystemTree> {
		const result = await Filesystem.readdir({path})

		const children: IFileSystemTreeItem[] = []
		for (const file of result.files) {
			if (file.type === 'file') {
				children.push({
					type: "file",
					name: file.name,
					path: file.uri
				})
			}
			else {
				const nestedChildren = await this.#tree(file.uri, file.name)
				children.push(nestedChildren)
			}
		}

		return {
			type: "directory",
			name: name ?? path,
			path,
			children,
		}
	}

	async ls(path: string): Promise<IFileSystemItem[]> {
		const result = await Filesystem.readdir({path})

		return result.files.map((file) => ({
			type: "file",
			name: file.name,
			path: file.name,
		}))
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
