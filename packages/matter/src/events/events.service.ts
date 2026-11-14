import {type EventMap, EventTypes, type MatterEvent} from "./events.js";
import type {IEventListener, IEventsService} from "./events.interface.ts";

type ListenerStore = {
	[Event in keyof EventMap]?: IEventListener<Event>[];
};

export class EventsService implements IEventsService {
	private readonly localBroadcastChannel: BroadcastChannel | undefined
	private listenerStore: ListenerStore

	constructor() {
		this.listenerStore = {}

		// todo: separate broadcast channel for different databases?
		// this.localBroadcastChannel = new BroadcastChannel(`matter_events`)
		// this.localBroadcastChannel.onmessage = (message: MessageEvent<MatterEvent>) => {
		// 	this.dispatch(message.data.type, message.data.detail)
		// }
	}

	async destroy() {
		this.listenerStore = {}
	}

	dispatch<Event extends keyof EventMap>(type: Event, detail: EventMap[Event]["detail"]): void {
		if (this.listenerStore[type]) {
			for (const listener of this.listenerStore[type]) {
				// @ts-ignore -- todo: fix type issue
				listener({type, detail})
			}
		}

		// Only broadcast events to other instances and the shared worker if they originate in the current context,
		// otherwise hello infinite event ping pong!
		// const deviceContext = ???
		// if (detail.context.id === deviceContext.id) {
		// 	if (this.localBroadcastChannel) {
		// 		this.localBroadcastChannel.postMessage({ type, detail })
		// 	}
		// }
	}

	subscribe<Event extends keyof EventMap>(type: Event, listener: IEventListener<Event>): void {
		if (!this.listenerStore[type]) {
			this.listenerStore[type] = []
		}
		this.listenerStore[type].push(listener)
	}

	unsubscribe<Event extends keyof EventMap>(type: Event, listener: IEventListener<Event>) {
		if (this.listenerStore[type]) {
			const index = this.listenerStore[type].indexOf(listener)
			if (index) {
				this.listenerStore[type].splice(index, 1)
			}
		}
	}

	subscribeAll(listener: (event: MatterEvent) => void) {
		this.subscribe(EventTypes.DOCUMENT_CREATE, listener)
		this.subscribe(EventTypes.DOCUMENT_UPDATE, listener)
		this.subscribe(EventTypes.DOCUMENT_DELETE, listener)
		this.subscribe(EventTypes.DOCUMENT_PURGE, listener)
		this.subscribe(EventTypes.VERSION_CREATE, listener)
		this.subscribe(EventTypes.VERSION_DELETE, listener)
	}

	unsubscribeAll(listener: (event: MatterEvent) => void) {
		this.unsubscribe(EventTypes.DOCUMENT_CREATE, listener)
		this.unsubscribe(EventTypes.DOCUMENT_UPDATE, listener)
		this.unsubscribe(EventTypes.DOCUMENT_DELETE, listener)
		this.unsubscribe(EventTypes.DOCUMENT_PURGE, listener)
		this.unsubscribe(EventTypes.VERSION_CREATE, listener)
		this.unsubscribe(EventTypes.VERSION_DELETE, listener)
	}
}
