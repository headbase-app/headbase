import {describe, expect, test} from "vitest"
import {h, ref} from "../hyper.ts";
import {HyperForm} from "./form.ts";

interface Note {
	name: string
	content: string
}

function getTestForm() {
	const helper = new HyperForm({
		initialValues: {
			name: ""
		}
	})
	const element = h<HTMLFormElement>("form", {[ref]: (f) => {helper.bindForm(f)}},
		h("div",
			h("label", "Name"),
			h<HTMLInputElement>("input", {[ref]: (i) => {helper.bindInput("name", i)}}),
			h("p", {[ref]: (i) => {helper.bindFieldError("name", i)}}),
		),
		h("button", "Submit")
	)

	return {helper, element}
}


describe("hyper", () => {
	describe('form', () => {
		test('form should be created', async () => {
			const {helper, element} = getTestForm();
			const input = element.el.querySelector("input")!;
			input.value = "new value"
			expect(helper.values.name).toEqual("new value")
		})
	})
})
