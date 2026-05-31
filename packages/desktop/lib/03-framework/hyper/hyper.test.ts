import {describe, expect, test} from "vitest"
import {h, ref} from "./hyper.ts";
import {_parseDescriptor} from "./utils.ts";

describe("hyper", () => {
	describe('_parseElementDescriptor', () => {
		test('tag only', async () => {
			expect(_parseDescriptor('a')).toEqual({tag: 'a'})
		})

		test('tag, id', async () => {
			expect(_parseDescriptor('a#example')).toEqual({tag: 'a', id: 'example'})
		})

		test('tag, class', async () => {
			expect(_parseDescriptor('a.class')).toEqual({tag: 'a', classNames: ['class']})
		})

		test('tag, class, id', async () => {
			expect(_parseDescriptor('a.class#id')).toEqual({tag: 'a', id: 'id', classNames: ['class']})
		})

		test('pick first id', async () => {
			expect(_parseDescriptor('a#id#id2')).toEqual({tag: 'a', id: 'id'})
		})

		test('include all classes', async () => {
			expect(_parseDescriptor('a.class1.class2.class3')).toEqual({tag: 'a', classNames: ["class1", "class2", "class3"]})
		})

		test('class with symbols', async () => {
			expect(_parseDescriptor('div.bem-class__one')).toEqual({tag: 'div', classNames: ["bem-class__one"]})
		})
	})

	describe('h', () => {
		test('should create element with class/ids', async () => {
			const button = h('button.btn#submit')
			expect(button.el).toBeInstanceOf(HTMLButtonElement)
			expect(button.el.id).toEqual("submit")
			expect(button.el.className).toEqual("btn")
		})

		test('should create element with added attributes', async () => {
			const button = h('button.btn#submit', {disabled: true})
			expect(button.el.getAttribute('disabled')).toEqual("true")
		})

		test('should create nested elements', async () => {
			const container = h('div.container',
				h('h1.title', "Hello World"),
				h('p.message', "This is a paragraph")
			)

			expect(container.el).toBeInstanceOf(HTMLDivElement)
			expect(container.el.childNodes[0]).toBeInstanceOf(HTMLHeadingElement)
			expect(container.el.childNodes[1]).toBeInstanceOf(HTMLParagraphElement)
		})

		test('should create nested arrays of elements', async () => {
			const container = h('ul',
				[h('li', "Item 1"), h('li', "Item 2"), h('li', "Item 3")]
			)

			expect(container.el).toBeInstanceOf(HTMLUListElement)
			expect(container.el.childNodes[0]).toBeInstanceOf(HTMLLIElement)
			expect(container.el.childNodes[1]).toBeInstanceOf(HTMLLIElement)
			expect(container.el.childNodes[2]).toBeInstanceOf(HTMLLIElement)
		})

		test('should append child html element', async () => {
			const title = h("h1", "Hello World").el
			const container = h('div', title)
			expect(container.el.childNodes[0]).toBeInstanceOf(HTMLHeadingElement)
		})

		test('should set refs correctly', async () => {
			let buttonRef!: HTMLButtonElement
			h<HTMLButtonElement>('button.btn#submit', {[ref]: (r) => {buttonRef=r}})
			expect(buttonRef).toBeInstanceOf(HTMLButtonElement)
		})
	})
})
