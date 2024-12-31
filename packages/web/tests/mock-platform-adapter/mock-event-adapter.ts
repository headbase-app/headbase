import {
	DeviceContext,
	EventsAdapter,
	EventsAdapterConfig,
} from "../../src/logic/services/database/adapter";
import {EventMap, EventTypes, HeadbaseEvent} from "../../src/logic/services/events/events";


export class MockEventAdapter implements EventsAdapter {
	readonly #context: DeviceContext
	readonly #eventTarget: EventTarget

	constructor(config: EventsAdapterConfig) {
		this.#context = config.context;
		this.#eventTarget = new EventTarget()
	}

	async destroy() {
		// todo: remove all event listeners?
	}

	dispatch<Event extends keyof EventMap>(type: Event, eventDetail: EventMap[Event]["detail"]): void {
		const event = new CustomEvent(type, { detail: eventDetail })
		this.#eventTarget.dispatchEvent(event)
	}

	subscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]["detail"]>) => void): void {
		this.#eventTarget.addEventListener(type, listener)
	}

	unsubscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]["detail"]>) => void): void {
		this.#eventTarget.removeEventListener(type, listener)
	}

	subscribeAll(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {
		for (const event of Object.values(EventTypes)) {
			this.#eventTarget.addEventListener(event, listener)
		}
	}

	unsubscribeAll(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {
		for (const event of Object.values(EventTypes)) {
			this.#eventTarget.removeEventListener(event, listener)
		}
	}
}