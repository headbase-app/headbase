import type {EventMap, HeadbaseEvent} from "@api/events/events";

export type IEventListener<Event extends keyof EventMap> = (event: EventMap[Event]) => void

export interface IEventsService {
	dispatch: <Event extends keyof EventMap>(type: Event, detail: EventMap[Event]["detail"]) => void
	subscribe: <Event extends keyof EventMap>(type: Event, listener: IEventListener<Event>) => void
	unsubscribe: <Event extends keyof EventMap>(type: Event, listener: IEventListener<Event>) => void
	subscribeAll: (listener: (event: HeadbaseEvent) => void) => void
	unsubscribeAll: (listener: (event: HeadbaseEvent) => void) => void
	destroy: () => void
}
