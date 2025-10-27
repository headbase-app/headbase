import { EventMap, EventIdentifiers, ServerEvent } from "@services/events/events";
import { Injectable } from "@nestjs/common";

// todo: can uses of this.eventTarget.addEventListener be made typesafe without using ts-expect-error.

/**
 * A service to dispatch and subscribe to events between different modules/services of the application.
 *
 * todo: replace with @nestjs/event-emitter?
 */
@Injectable()
export class EventsService {
	eventTarget: EventTarget;

	constructor() {
		this.eventTarget = new EventTarget();
	}

	dispatch(event: ServerEvent) {
		const customEvent = new CustomEvent(event.type, { detail: event.detail });
		this.eventTarget.dispatchEvent(customEvent);
	}

	subscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]["detail"]>) => void) {
		this.eventTarget.addEventListener(type, listener);
	}

	unsubscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]["detail"]>) => void) {
		this.eventTarget.removeEventListener(type, listener);
	}

	subscribeAll(listener: (e: CustomEvent<ServerEvent>) => void) {
		for (const event of Object.values(EventIdentifiers)) {
			this.eventTarget.addEventListener(event, listener);
		}
	}

	unsubscribeAll(listener: (e: CustomEvent<ServerEvent>) => void) {
		for (const event of Object.values(EventIdentifiers)) {
			this.eventTarget.removeEventListener(event, listener);
		}
	}
}
