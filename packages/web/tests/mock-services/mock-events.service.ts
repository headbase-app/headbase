import {
	DeviceContext, EventsServiceConfig,
	IEventsService,
} from "../../src/logic/services/database/interfaces";
import {EventMap, EventTypes, HeadbaseEvent} from "../../src/logic/services/events/events";


export class MockEventsService implements IEventsService {
	private readonly context: DeviceContext
	private readonly eventTarget: EventTarget

	constructor(config: EventsServiceConfig) {
		this.context = config.context;
		this.eventTarget = new EventTarget()
	}

	async destroy() {
		// todo: remove all event listeners?
	}

	dispatch<Event extends keyof EventMap>(type: Event, eventDetail: EventMap[Event]["detail"]): void {
		const event = new CustomEvent(type, { detail: eventDetail })
		this.eventTarget.dispatchEvent(event)
	}

	subscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]["detail"]>) => void): void {
		// @ts-expect-error - We can add a callback for custom events!
		this.eventTarget.addEventListener(type, listener)
	}

	unsubscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]["detail"]>) => void): void {
		// @ts-expect-error - We can add a callback for custom events!
		this.eventTarget.removeEventListener(type, listener)
	}

	subscribeAll(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {
		for (const event of Object.values(EventTypes)) {
			// @ts-expect-error - We can add a callback for custom events!
			this.eventTarget.addEventListener(event, listener)
		}
	}

	unsubscribeAll(listener: (e: CustomEvent<HeadbaseEvent>) => void): void {
		for (const event of Object.values(EventTypes)) {
			// @ts-expect-error - We can add a callback for custom events!
			this.eventTarget.removeEventListener(event, listener)
		}
	}
}
