import {AnnotationActionEventType} from "pdfjs-dist/types/src/shared/util";
import Fo = AnnotationActionEventType.Fo;

export function hform()


class FormFactory {
	constructor(
		private parent: HTMLElement,
	) {

	}

	addInput() {
		return this
	}
	addTextArea() {
		return this
	}

	addSubmitText() {
		return this
	}

	onSubmit() {
		return this
	}

	mount() {
		return this
	}

	unmount() {}
}


const parent = document.getElementById('id')!
const vaultEditForm = new FormFactory()
	.addInput({
		name: 'name',
		label: "Display Name",
	})
	.addInput({
		name: 'name',
		label: "Name"
	})
	.addTextArea({
		name: 'description',
		label: "Description"
	})
	.addSubmitText("Create vault")
	.onSubmit(fields => {

	})
	.mount(parent)

vaultEditForm.unmount()
