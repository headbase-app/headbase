import {html} from "lit-html";
import {BaseElement, DataObject, SourcePlugin, ViewMetadata, ViewPlugin} from "@headbase-app/lib";
import {InferObjectFromFieldDefinitions} from "../../02-apis/plugin/plugins/source-plugin/dynamic-fields.ts";


class CardsViewElement extends BaseElement {
	static tag = "hb-cards-view";
	sources!: SourcePlugin[];
	settings!: InferObjectFromFieldDefinitions<typeof CardsMetadata["settings"]>
	results: DataObject[] = []

	async load() {
		console.log("[views][cards] Loading cards view")
		const results: DataObject[] = []
		for (const source of this.sources) {
			const sourceResults = await source.query()
			results.push(...sourceResults)
		}
		this.results = results;

		this.requestUpdate()
	}

	async unload() {
	}

	async reload() {
	}

	render() {
		if (this.results.length === 0) {
			return html`<p>No Results Found</p>`
		}
		else {
			return html`
				${this.results.map(result => html`
					<div>
						<h3>${result.$file.name}</h3>
					</div>
				`)}
			`
		}
	}
}
customElements.define(CardsViewElement.tag, CardsViewElement)


const CardsMetadata = {
	id: "https://spec.headbase.app/v1/views/cards",
	name: "Cards",
	description: "Display cards in a list or grid format.",
	settings: {
		layout: {
			label: "Layout",
			type: "select",
			hint: "How should the cards be displayed?",
			settings: {
				options: ["list", "grid"]
			},
			defaultValue: "list",
		},
	}
} satisfies ViewMetadata

export class CardsView extends ViewPlugin {
	static meta: ViewMetadata = CardsMetadata
	element!: CardsViewElement

	async load(
		settings: InferObjectFromFieldDefinitions<typeof CardsMetadata["settings"]>
	) {
		this.element = document.createElement('hb-cards-view') as CardsViewElement
		this.element.sources = this.sources
		this.element.settings = settings
		this.container.append(this.element)
		await this.element.load()
	}

	async unload() {
		await this.element.unload()
		this.container.innerHTML = ""
	}

	async reload() {
		await this.element.reload()
	}
}
