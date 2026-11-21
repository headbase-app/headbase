import {BehaviorSubject} from "rxjs";

import {
	BaseElement,
	useContext, MatterDatabaseAPIContext, type LiveQueryResult, DatabaseDto, LIVE_QUERY_LOADING_STATE
} from "@headbase-app/lib";
import type {MatterDocument} from "@headbase-app/matter";
import {html, type TemplateResult} from "lit-html";

export class Search extends BaseElement {
	static tag = "hb-search";

	// todo: useContext should no longer be used for features added via plugins
	databaseAPI = useContext(MatterDatabaseAPIContext)

	documents$: BehaviorSubject<LiveQueryResult<MatterDocument[]>>

	constructor() {
		super();
		this.documents$ = this.createState(LIVE_QUERY_LOADING_STATE, this.databaseAPI.rxjs.liveQuery())
	}

	async connectedCallback() {
		super.connectedCallback();
		this.requestUpdate()
	}

	render() {
		let content: TemplateResult;

		if (this.documents$.value.status === "loading") {
			content = html`<p>Loading...</p>`;
		}
		else if (this.documents$.value.status === "error") {
			content = html`<p>Error loading documents: ${this.documents$.value.errors.toString()}</p>`
		}
		else {
			const documents = this.documents$.value.result
			content = html`
				<ul>
					${documents.map(doc => html`
						<li>
							<h3>${doc.id}</h3><p>${doc.type}</p>
							<p>${JSON.stringify(doc.data)}</p>
							<button>open</button>
						</li>
					`)}
				</ul>
			`
		}

		return html`
			<div>
				${content}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[Search.tag]: Search
	}
}
