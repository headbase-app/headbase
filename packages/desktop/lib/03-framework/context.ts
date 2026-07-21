export interface Context<T> {
	key: T
}

export type ContextCallback<T> = (
	value: T,
) => void;

export class ContextRequestEvent<T> extends Event {
	public constructor(
		public readonly context: Context<T>,
		public readonly callback: ContextCallback<T>,
	) {
		super('context-request', {bubbles: true, composed: true});
	}
}

export function createContext<T>(key: string|symbol) {
	return key as unknown as Context<T>
}

export function useContext<T>(context: Context<T>, target?: HTMLElement|Document|DocumentFragment): T {
	let value: T|null = null
	const request = new ContextRequestEvent(context, (v) => {value = v})
	if (target) {
		target.dispatchEvent(request)
	} else {
		document.dispatchEvent(request)
	}

	if (!value) {
		throw new Error(`[context] Attempted to consume ${context} but not provided.`)
	}

	return value
}

export interface ContextStore {
	[key: string|symbol]: never
}


export class ContextProvider {
	#target: HTMLElement | Document | DocumentFragment
	contexts: ContextStore;
	identifier?: string

	constructor(
		target?: HTMLElement | Document | DocumentFragment,
		identifier?: string,
	) {
		this.handleContextRequest = this.handleContextRequest.bind(this)

		this.#target = target ?? document
		this.identifier = identifier
		// @ts-ignore -- This is handling a custom event so types are good.
		this.#target.addEventListener("context-request", this.handleContextRequest);
		this.contexts = {}
	}

	handleContextRequest(event: ContextRequestEvent<never>) {
		// console.debug(`[ContextProvider] handleContextRequest '${event.context}' (${this.identifier})`)

		const key = event.context as unknown as string|symbol
		if (this.contexts[key]) {
			event.callback(this.contexts[key])
			event.stopImmediatePropagation();
		}
	}

	add<T>(context: Context<T>, value: T) {
		const key = context as unknown as string|symbol
		this.contexts[key] = value as never
	}

	stop() {
		// @ts-ignore -- This is handling a custom event so types are good.
		this.#target.removeEventListener("context-request", this.handleContextRequest)
	}
}
