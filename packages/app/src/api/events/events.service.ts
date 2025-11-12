import {type EventMap, EventTypes, type HeadbaseEvent} from "./events";
import type {IEventListener, IEventsService} from "./events.interface";
import type {IDeviceService} from "@api/device/device.interface";

type ListenerStore = {
	[Event in keyof EventMap]?: IEventListener<Event>[];
};

export class EventsService implements IEventsService {
	private readonly localBroadcastChannel: BroadcastChannel | undefined
	private listenerStore: ListenerStore

	constructor(
		private readonly deviceService: IDeviceService,
	) {
		this.listenerStore = {}

		// todo: separate broadcast channel for different databases?
		this.localBroadcastChannel = new BroadcastChannel(`headbase_events`)
		this.localBroadcastChannel.onmessage = (message: MessageEvent<HeadbaseEvent>) => {
			this.dispatch(message.data.type, message.data.detail)
		}
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

		console.debug(`[events] dispatched "${type}":`, detail)

		// Only broadcast events to other instances and the shared worker if they originate in the current context,
		// otherwise hello infinite event ping pong!
		const deviceContext = this.deviceService.getCurrentContext()
		if (detail.context.id === deviceContext.id) {
			if (this.localBroadcastChannel) {
				// Don't send open/close events as that is unique to every instance.
				if (type !== EventTypes.DATABASE_OPEN && type !== EventTypes.DATABASE_CLOSE) {
					this.localBroadcastChannel.postMessage({ type, detail })
				}
			}
		}
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

	subscribeAll(listener: (event: HeadbaseEvent) => void) {
		this.subscribe(EventTypes.FILE_SYSTEM_CHANGE, listener)
		this.subscribe(EventTypes.DATABASE_OPEN, listener)
		this.subscribe(EventTypes.DATABASE_CLOSE, listener)
		this.subscribe(EventTypes.DATABASE_CHANGE, listener)
		this.subscribe(EventTypes.STORAGE_PERMISSION, listener)
		this.subscribe(EventTypes.USER_LOGIN, listener)
		this.subscribe(EventTypes.USER_LOGOUT, listener)
	}

	unsubscribeAll(listener: (event: HeadbaseEvent) => void) {
		this.unsubscribe(EventTypes.FILE_SYSTEM_CHANGE, listener)
		this.unsubscribe(EventTypes.DATABASE_OPEN, listener)
		this.unsubscribe(EventTypes.DATABASE_CLOSE, listener)
		this.unsubscribe(EventTypes.DATABASE_CHANGE, listener)
		this.unsubscribe(EventTypes.STORAGE_PERMISSION, listener)
		this.unsubscribe(EventTypes.USER_LOGIN, listener)
		this.unsubscribe(EventTypes.USER_LOGOUT, listener)
	}
}
