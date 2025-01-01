import {DeviceContext, IEventsService, EventsServiceConfig} from "../interfaces.ts";
import {EventMap, EventTypes, HeadbaseEvent} from "./events.ts";


export class WebEventsService implements IEventsService {
	private readonly context: DeviceContext
	private readonly eventTarget: EventTarget
	private readonly localBroadcastChannel: BroadcastChannel | undefined

	constructor(config: EventsServiceConfig) {
		this.context = config.context;

		// todo: separate broadcast channel for different databases?
		this.eventTarget = new EventTarget()
		this.localBroadcastChannel = new BroadcastChannel(`headbase_events`)
		this.localBroadcastChannel.onmessage = (message: MessageEvent<HeadbaseEvent>) => {
			this.dispatch(message.data.type, message.data.detail)
		}
	}

	async destroy() {
		// todo: remove all event listeners?
	}

	dispatch<Event extends keyof EventMap>(type: Event, eventDetail: EventMap[Event]["detail"]): void {
		const event = new CustomEvent(type, { detail: eventDetail })
		this.eventTarget.dispatchEvent(event)

		// Only broadcast events to other instances and the shared worker if they originate in the current context,
		// otherwise hello infinite event ping pong!
		if (event.detail.context.id === this.context.id) {
			if (this.localBroadcastChannel) {
				// Don't send open/close events as that is unique to every instance.
				if (type !== EventTypes.DATABASE_OPEN && type !== EventTypes.DATABASE_CLOSE) {
					this.localBroadcastChannel.postMessage({ type, detail: eventDetail })
				}
			}
		}
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
