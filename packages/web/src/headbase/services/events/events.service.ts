import {DeviceContext} from "../../interfaces.ts";
import {EventMap, EventTypes, HeadbaseEvent} from "./events.ts";

export interface EventsServiceConfig {
	context: DeviceContext
}

export type Listener<Event extends keyof EventMap> = (event: EventMap[Event]) => void
type ListenerStore = {
	[Event in keyof EventMap]?: Listener<Event>[];
};


export class EventsService {
	private readonly context: DeviceContext
	private readonly localBroadcastChannel: BroadcastChannel | undefined
	private listeners: ListenerStore

	constructor(config: EventsServiceConfig) {
		this.context = config.context;
		this.listeners = {}

		// todo: separate broadcast channel for different databases?
		this.localBroadcastChannel = new BroadcastChannel(`headbase_events`)
		this.localBroadcastChannel.onmessage = (message: MessageEvent<HeadbaseEvent>) => {
			this.dispatch(message.data.type, message.data.detail)
		}
	}

	async destroy() {
		this.listeners = {}
	}

	dispatch<Event extends keyof EventMap>(type: Event, detail: EventMap[Event]["detail"]): void {
		if (this.listeners[type]) {
			for (const listener of this.listeners[type]) {
				listener({type, detail})
			}
		}

		// Only broadcast events to other instances and the shared worker if they originate in the current context,
		// otherwise hello infinite event ping pong!
		if (detail.context.id === this.context.id) {
			if (this.localBroadcastChannel) {
				// Don't send open/close events as that is unique to every instance.
				if (type !== EventTypes.DATABASE_OPEN && type !== EventTypes.DATABASE_CLOSE) {
					this.localBroadcastChannel.postMessage({ type, detail })
				}
			}
		}
	}

	subscribe<Event extends keyof EventMap>(type: Event, listener: Listener<Event>): void {
		if (!this.listeners[type]) {
			this.listeners[type] = []
		}
		this.listeners[type].push(listener)
	}

	unsubscribe<Event extends keyof EventMap>(type: Event, listener: Listener<Event>) {
		if (this.listeners[type]) {
			const index = this.listeners[type].indexOf(listener)
			if (index) {
				this.listeners[type].splice(index, 1)
			}
		}
	}

	subscribeAll(listener: (event: HeadbaseEvent) => void) {
		this.subscribe(EventTypes.FILE_SYSTEM_CHANGE, listener)
		this.subscribe(EventTypes.DATABASE_OPEN, listener)
		this.subscribe(EventTypes.DATABASE_CLOSE, listener)
		this.subscribe(EventTypes.DATABASE_UNLOCK, listener)
		this.subscribe(EventTypes.DATABASE_LOCK, listener)
		this.subscribe(EventTypes.DATABASE_CHANGE, listener)
		this.subscribe(EventTypes.STORAGE_PERMISSION, listener)
		this.subscribe(EventTypes.USER_LOGIN, listener)
		this.subscribe(EventTypes.USER_LOGOUT, listener)
	}

	unsubscribeAll(listener: (event: HeadbaseEvent) => void) {
		this.unsubscribe(EventTypes.FILE_SYSTEM_CHANGE, listener)
		this.unsubscribe(EventTypes.DATABASE_OPEN, listener)
		this.unsubscribe(EventTypes.DATABASE_CLOSE, listener)
		this.unsubscribe(EventTypes.DATABASE_UNLOCK, listener)
		this.unsubscribe(EventTypes.DATABASE_LOCK, listener)
		this.unsubscribe(EventTypes.DATABASE_CHANGE, listener)
		this.unsubscribe(EventTypes.STORAGE_PERMISSION, listener)
		this.unsubscribe(EventTypes.USER_LOGIN, listener)
		this.unsubscribe(EventTypes.USER_LOGOUT, listener)
	}
}
