import {HyperElement, ref} from "./hyper.ts";
import {Observable} from "rxjs";

export interface ElementAttributes<Element extends HTMLElement> {
	[key: string]: string | number | boolean | ((...args: never[]) => void)
	[ref]?: (el: Element) => void
}

export interface _ElementDescriptor {
	tag: string
	classNames?: string[]
	id?: string
}
const idRegEx = new RegExp(/#[\w_\-]+/g);
const classRegEx = new RegExp(/\.[\w_\-]+/g);
export function _parseDescriptor(creator: string): _ElementDescriptor {
	const id = creator.match(idRegEx)?.at(0)?.replaceAll("#", "");
	const classNames = Array.from(creator.match(classRegEx)?.map(e => e.replaceAll(".", "")) ?? [])
	const tag = creator.replaceAll(idRegEx, '').replaceAll(classRegEx, '') ?? 'div';

	return {tag, id, classNames: classNames.length ? classNames : undefined}
}


type HyperArg <Element extends HTMLElement> = ElementAttributes<Element>|HyperElement<HTMLElement>|HyperElement<HTMLElement>[]|HTMLElement|string|boolean|null|undefined|Observable<HyperElement<HTMLElement>>
export type HyperArgs<Element extends HTMLElement> = HyperArg<Element>[]

export function isChildArg(arg: HyperArg<never>){
	return ['string', 'boolean', 'undefined'].includes(typeof arg) || arg === null || arg instanceof HyperElement || Array.isArray(arg) || arg instanceof HTMLElement || arg instanceof Observable;
}
export type ChildArg<Element extends HTMLElement> = Exclude<HyperArgs<Element>, ElementAttributes<Element>>
