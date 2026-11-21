import {type EventMap, EventTypes, type HeadbaseEvent} from "./events";
import type {IEventListener, IEventsService} from "./events.service";
import type {IDeviceAPI} from "../device/device.api.js";

type ListenerStore = {
	[Event in keyof EventMap]?: IEventListener<Event>[];
};

export class CommonEventsService implements IEventsService {
	private readonly localBroadcastChannel: BroadcastChannel | undefined
	private listenerStore: ListenerStore

	constructor(
		private readonly deviceService: IDeviceAPI,
	) {
		this.listenerStore = {}

		// todo: separate broadcast channel for different databases?
		// this.localBroadcastChannel = new BroadcastChannel(`headbase_events`)
		// this.localBroadcastChannel.onmessage = (message: MessageEvent<HeadbaseEvent>) => {
		// 	this.dispatch(message.data.type, message.data.detail)
		// }
	}

	async destroy() {
		this.listenerStore = {}
	}

	async dispatch<Event extends keyof EventMap>(type: Event, detail: EventMap[Event]["detail"]) {
		if (this.listenerStore[type]) {
			for (const listener of this.listenerStore[type]) {
				// @ts-ignore -- todo: fix type issue
				listener({type, detail})
			}
		}
		console.debug(`[events] dispatched "${type}":`, detail)
	}

	subscribe<Event extends keyof EventMap>(type: Event, listener: IEventListener<Event>) {
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

	subscribeAll(listener: (event: HeadbaseEvent) => void) {
		this.subscribe(EventTypes.DATABASE_OPEN, listener)
		this.subscribe(EventTypes.DATABASE_CLOSE, listener)
		this.subscribe(EventTypes.DATABASE_CHANGE, listener)
	}

	unsubscribeAll(listener: (event: HeadbaseEvent) => void) {
		this.unsubscribe(EventTypes.DATABASE_OPEN, listener)
		this.unsubscribe(EventTypes.DATABASE_CLOSE, listener)
		this.unsubscribe(EventTypes.DATABASE_CHANGE, listener)
	}
}
