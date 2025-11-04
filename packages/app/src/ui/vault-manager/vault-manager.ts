import {html, render} from "lit-html";
import {I18nService} from "../../services/i18n.ts";
import {createRef, type Ref, ref} from "lit-html/directives/ref.js";

export class VaultManager {
	dialog: Ref<HTMLDialogElement> = createRef<HTMLDialogElement>();

	constructor(
		private readonly i18n: I18nService
	) {}

	init(){
		this.render()
		document.addEventListener("VaultManager_trigger", this.onTrigger.bind(this))
	}

	destroy(){
		document.removeEventListener("VaultManager_trigger", this.onTrigger.bind(this))
	}

	onTrigger() {
		this.dialog?.value?.showModal()
	}

	onClose() {
		this.dialog?.value?.close()
	}

	render() {
		const modal = html`
			<dialog ${ref(this.dialog)}>
				<button autofocus @click=${this.onClose.bind(this)}>${this.i18n.t("vaultModal.close")}</button>
				<p>This modal dialog has a groovy backdrop!</p>
				<div>
					<p>This is a test</p>
					<div>
						<label for="name">Name</label>
						<input id="name" name="name" placeholder=${this.i18n.t("Name here")} />
					</div>
					<div>
						<label for="description">Description</label>
						<div id="description-popover" popover>${this.i18n.t("The description is used to provide extra info.")}</div>
						<button aria-label="What is the description for?" popovertarget="description-popover">?</button>
						<textarea id="description" name="description" placeholder=${this.i18n.t("Description Here")}></textarea>
					</div>
					<div>
						<button>Submit</button>
					</div>
				</div>
			</dialog>
		`
		render(modal, document.body)
	}
}
