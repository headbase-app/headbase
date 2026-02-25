import {type EventMap, EventTypes, type HeadbaseEvent} from "./events";
import type {IEventListener, IEventsService} from "./events.service";
import type {IDeviceAPI} from "../../apis/device.api";

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
				if (type !== EventTypes.VAULT_OPEN && type !== EventTypes.VAULT_CLOSE) {
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
		this.subscribe(EventTypes.FILE_CHANGE, listener)
		this.subscribe(EventTypes.VAULT_OPEN, listener)
		this.subscribe(EventTypes.VAULT_CLOSE, listener)
		this.subscribe(EventTypes.VAULT_CHANGE, listener)
	}

	unsubscribeAll(listener: (event: HeadbaseEvent) => void) {
		this.unsubscribe(EventTypes.FILE_CHANGE, listener)
		this.unsubscribe(EventTypes.VAULT_OPEN, listener)
		this.unsubscribe(EventTypes.VAULT_CLOSE, listener)
		this.unsubscribe(EventTypes.VAULT_CHANGE, listener)
	}
}
