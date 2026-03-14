import {html, render} from "lit";
import {type Observable, of, type Subscription, switchMap, startWith} from "rxjs";

import {
	type IFilesAPI, type IFileSystemTree,
	type IWorkspaceVaultAPI, LIVE_QUERY_LOADING_STATE, type LiveQueryResult, ObservableProperty,
} from "@headbase-app/lib";

import { useContext, createContext } from "./context"

export const VanillaWorkspaceVaultAPIContext = createContext<IWorkspaceVaultAPI>("WorkspaceVaultAPI")
export const VanillaFilesAPIContext = createContext<IFilesAPI>("FilesAPI")

class ReflectedObservable<T> {
	value?: T
	sub?: Subscription

	constructor(initialValue?: T) {
		this.value = initialValue
	}

	subscribe(observable: Observable<T>, callback?: (next: T) => void) {
		this.sub = observable.subscribe((next) => {
			this.value = next
			callback?.(next)
		})
	}
}

export abstract class BaseElement extends HTMLElement {
	connectedCallback() {
		console.debug("base connectedCallback")
		this.render()
	}
	disconnectedCallback() {
		console.debug("base connectedCallback")
	}
	render() {
		console.debug("base render")
	}
}

export class FileExplorerVanilla extends BaseElement {
	static tag = "hb-file-explorer-vanilla"
	workspaceVaultAPI = useContext(VanillaWorkspaceVaultAPIContext)
	filesAPI = useContext(VanillaFilesAPIContext)
	fileTree$ = new ReflectedObservable<LiveQueryResult<IFileSystemTree | null> | undefined>(LIVE_QUERY_LOADING_STATE)

	connectedCallback() {
		super.connectedCallback()
		this.fileTree$.subscribe(
			this.workspaceVaultAPI.liveGet().pipe(
				switchMap(vaultQuery => {
					if (vaultQuery.status === "success" && vaultQuery.result) {
						return this.filesAPI.liveTree(vaultQuery.result.path)
					}
					return of(undefined)
				}),
			), () => {this.render()}
		)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.fileTree$.sub?.unsubscribe()
	}

	render() {
		console.debug('render hb-file-explorer-vanilla', this.fileTree$.value)
		render(html`<p>hb-file-explorer-vanilla</p>`, this)
	}
}
