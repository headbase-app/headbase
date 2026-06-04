import {_parseDescriptor, ChildArg, ElementAttributes, HyperArgs, isChildArg} from "./utils.ts";
import {Observable, Subject} from "rxjs";

export const ref = Symbol("hyper-ref")

export class HyperElement<Element extends HTMLElement> {
	constructor(
		public el: Element,
	) {}

	mount(container: HTMLElement|HyperElement<HTMLElement>) {
		(container instanceof HyperElement ? container.el : container).append(this.el)
		return this
	}

	mountReplace(container: HTMLElement|HyperElement<HTMLElement>) {
		(container instanceof HyperElement ? container.el : container).replaceChildren(this.el)
		return this
	}
}

export function h<Element extends HTMLElement>(descriptor: string, ...args: HyperArgs<Element>): HyperElement<Element> {
	let {tag, id, classNames} = _parseDescriptor(descriptor)

	const el = document.createElement(tag) as Element
	if (id) el.id = id
	if (classNames) classNames.forEach(className => el.classList.add(className))

	const attributesObjs = args.filter(a => !isChildArg(a)) as ElementAttributes<Element>[]
	const children = args.filter(isChildArg) as ChildArg<never>

	for (const attributes of attributesObjs) {
		if (attributes[ref]) {
			// @ts-ignore
			attributes[ref](el)
		}

		for (const [key, value] of Object.entries(attributes)) {
			if (typeof value === 'function') {
				// @ts-ignore
				el[key.toLowerCase()] = value
			}
			else {
				el.setAttribute(key, `${value}`)
			}
		}
	}

	for (const child of children) {
		if (typeof child === 'string') {
			const textChild = document.createTextNode(child)
			el.append(textChild)
		}
		else if (child instanceof HyperElement) {
			child.mount(el)
		}
		else if (Array.isArray(child)) {
			for (const nestedChild of child) {
				nestedChild.mount(el)
			}
		}
		else if (child instanceof HTMLElement) {
			el.append(child)
		}
		else if (child instanceof Observable) {
			console.debug("h obs")
			let current: HTMLElement | CharacterData = document.createComment("<hyper-observerbale>");
			el.append(current)

			// Replace dom element whenever observable changes.
			const subscription = child.subscribe((v) => {
				current.replaceWith(v.el)
				current = v.el
			})

			// Listen for current "parent" element being removed from DOM to clean up subscriptions.
			const observer = new MutationObserver((mutations) => {
				for (const m of mutations) {
					console.debug(m)
					if (m.target === el) {
						console.debug("RMEOVED")
						observer.disconnect()
						subscription.unsubscribe()
					}
				}
			})
			observer.observe(el, {characterData: true})
		}
	}

	return new HyperElement<Element>(el)
}
