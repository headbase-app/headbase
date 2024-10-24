import {EventMap, EventIdentifiers, ServerEvent} from "@services/events/events.js";

// todo: can uses of this.eventTarget.addEventListener be made typesafe without using ts-expect-error.

export class EventsService {
    eventTarget: EventTarget;
    
    constructor() {
        this.eventTarget = new EventTarget();
    }

    async dispatch(event: ServerEvent) {
        const customEvent = new CustomEvent(event.type, {detail: event.detail})
        this.eventTarget.dispatchEvent(customEvent)
    }

    subscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]["detail"]>) => void) {
        // @ts-expect-error -- just allow for now, allows typing to work well for consumers.
        this.eventTarget.addEventListener(type, listener)
    }

    unsubscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]["detail"]>) => void) {
        // @ts-expect-error -- just allow for now, allows typing to work well for consumers.
        this.eventTarget.removeEventListener(type, listener)
    }

    subscribeAll(listener: (e: CustomEvent<ServerEvent>) => void) {
        for (const event of Object.values(EventIdentifiers)) {
            // @ts-expect-error -- just allow for now, allows typing to work well for consumers.
            this.eventTarget.addEventListener(event, listener)
        }
    }

    unsubscribeAll(listener: (e: CustomEvent<ServerEvent>) => void) {
        for (const event of Object.values(EventIdentifiers)) {
            // @ts-expect-error -- just allow for now, allows typing to work well for consumers.
            this.eventTarget.removeEventListener(event, listener)
        }
    }
}
