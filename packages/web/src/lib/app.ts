import { html } from "lit-html";
import {choose} from "lit-html/directives/choose.js";
import { BehaviorSubject, Subscription } from "rxjs";

import {BaseElement} from "./03-framework/base-element.ts";
import {LIVE_QUERY_LOADING_STATE, LiveQueryStatus} from "./01-common/control-flow.ts";
import type {LiveQueryResult} from "./01-common/control-flow.ts";
import {DatabaseDto} from "./02-apis/database-manager/database.ts";

import {ContextProvider, createContext, useContext} from "./03-framework/context.ts";
import {DatabaseSwitcherAPIContext} from "./03-framework/contexts.ts";

export const AppRouterContext = createContext<BehaviorSubject<string>>("AppRouter")
const routes = {
	splash: "/",
	welcome: "/welcome",
	manageDatabases: "/manage-databases",
	app: "/app"
}

export class HeadbaseApp extends BaseElement {
	static tag = "hb-app"

	contextProvider: ContextProvider

	databaseSwitcherAPI = useContext(DatabaseSwitcherAPIContext)

	currentPage$: BehaviorSubject<string>
	currentDatabase$: BehaviorSubject<LiveQueryResult<DatabaseDto | null>>
	currentDatabaseSubscription: Subscription

	constructor() {
		super();
		this.contextProvider = new ContextProvider(this, "hb-app")
		this.currentPage$ = this.createState(routes.splash)
		this.contextProvider.add(AppRouterContext, this.currentPage$)
		this.currentDatabase$ = this.createState<LiveQueryResult<DatabaseDto | null>>(LIVE_QUERY_LOADING_STATE, this.databaseSwitcherAPI.liveGet())
		this.currentDatabaseSubscription = this.currentDatabase$.subscribe((v) => this.handleDatabaseChange(v))
	}

	async connectedCallback() {
		// todo: request persistent browser storage
	}

	handleDatabaseChange(state: LiveQueryResult<DatabaseDto | null>) {
		if (state.status === LiveQueryStatus.SUCCESS) {
			if (state.result) {
				this.currentPage$.next(routes.app)
			} else {
				this.currentPage$.next(routes.manageDatabases)
			}
		}
		// todo: handle error?
	}

	render() {
		return html`
			${choose(this.currentPage$.value, [
				[routes.splash, () => html`<hb-page-splash></hb-page-splash>`],
				[routes.welcome, () => html`<hb-page-welcome></hb-page-welcome>`],
				[routes.manageDatabases, () => html`<hb-page-manage-databases></hb-page-manage-databases>`],
				[routes.app, () => html`<hb-page-app></hb-page-app>`],
		])}
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[HeadbaseApp.tag]: HeadbaseApp
	}
}

