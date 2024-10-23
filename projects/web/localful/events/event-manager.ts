import {EventContext, EventMap, EventTypes, LocalfulEvent} from "./events";
import { LocalfulEncryption } from "../encryption/encryption";
import {Logger} from "../../src/utils/logger";

/**
 * Handles events throughout Localful, including communicating with
 * Localful instances in other browser contexts.
 *
 */
export class EventManager {
	eventTarget: EventTarget
	localBroadcastChannel: BroadcastChannel | undefined
	contextId: string

	constructor() {
		this.eventTarget = new EventTarget()
		this.contextId = LocalfulEncryption.generateUUID()

		this.localBroadcastChannel = new BroadcastChannel("localful_events")
		this.localBroadcastChannel.onmessage = (message: MessageEvent<LocalfulEvent>) => {
			Logger.debug('[EventManager] Received broadcast channel message', message.data)
			this.dispatch(message.data.type, message.data.detail.data, message.data.detail.context)
		}
	}

	close() {
		this.localBroadcastChannel?.close()
	}

	// todo: fix types
	dispatch<Event extends keyof EventMap>(type: Event, data: EventMap[Event]['detail']['data'], context?: EventContext) {
		const eventDetail = {
			context: context || {contextId: this.contextId},
			data: data,
		}

		Logger.debug(`[EventManager] Dispatching event:`, type, eventDetail)

		const event = new CustomEvent(type, { detail: eventDetail })
		this.eventTarget.dispatchEvent(event)

		// Only broadcast events to other instances and the shared worker if they originate in the current context,
		// otherwise hello infinite event ping pong!
		if (event.detail.context.contextId === this.contextId) {
			if (this.localBroadcastChannel) {
				// Don't send open/close events as that is unique to every instance.
				if (type !== EventTypes.DATABASE_OPEN && type !== EventTypes.DATABASE_CLOSE) {
					this.localBroadcastChannel.postMessage({ type, detail: eventDetail })
				}
			}
		}
	}

	subscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void) {
		// @ts-expect-error - We can add a callback for custom events!
		this.eventTarget.addEventListener(type, listener)
	}

	unsubscribe<Event extends keyof EventMap>(type: Event, listener: (e: CustomEvent<EventMap[Event]['detail']>) => void) {
		// @ts-expect-error - We can add a callback for custom events!
		this.eventTarget.removeEventListener(type, listener)
	}

	subscribeAll(listener: (e: CustomEvent<LocalfulEvent>) => void) {
		for (const event of Object.values(EventTypes)) {
			// @ts-expect-error - We can add a callback for custom events!
			this.eventTarget.addEventListener(event, listener)
		}
	}

	unsubscribeAll(listener: (e: CustomEvent<LocalfulEvent>) => void) {
		for (const event of Object.values(EventTypes)) {
			// @ts-expect-error - We can add a callback for custom events!
			this.eventTarget.removeEventListener(event, listener)
		}
	}
}
