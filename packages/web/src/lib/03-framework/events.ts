type EventSource = Document | DocumentFragment | HTMLElement

type DispatchOptions = {
	bubbles?: boolean
	composed?: boolean
	cancelable?: boolean
}

export function dispatchEvent<
	EventMap,
	Key extends keyof EventMap = keyof EventMap,
>(source: EventSource, event: Key, detail: EventMap[Key], options?: DispatchOptions) {
	const customEvent = new CustomEvent(event as string, {
		detail,
		...(options ? options : {bubbles: true, composed: true}),
	})
	source.dispatchEvent(customEvent)
}

type TypedCustomEvent<T> = Event & {detail: T}

export function addEventListener<
	EventMap,
	Key extends keyof EventMap = keyof EventMap
>(source: EventSource, event: Key, callback: (detail: TypedCustomEvent<EventMap[Key]>) => void) {
	source.addEventListener(event as string, callback as EventListener)
}

export function removeEventListener<
	EventMap,
	Key extends keyof EventMap = keyof EventMap
>(source: EventSource, event: Key, callback: (detail: TypedCustomEvent<EventMap[Key]>) => void) {
	source.removeEventListener(event as string, callback as EventListener)
}
