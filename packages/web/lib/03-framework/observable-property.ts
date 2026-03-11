import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {Observable, Subscription} from "rxjs";

export interface ObservablePropertyOptions<T> {
	host: ReactiveControllerHost
	observable: Observable<T>
	forceUpdateRender?: boolean
}

export class ObservableProperty<T> implements ReactiveController {
	#host: ReactiveControllerHost
	#observable: Observable<T>
	#subscription?: Subscription
	#forceUpdateRender: boolean
	value!: T

	constructor(options: ObservablePropertyOptions<T>) {
		this.#host = options.host;
		this.#host.addController(this);
		this.#observable = options.observable;
		this.#forceUpdateRender = options.forceUpdateRender ?? false
	}

	hostConnected() {
		this.#subscription = this.#observable.subscribe(next => {
			this.value = next

			if (this.#forceUpdateRender) {
				this.#host.requestUpdate()
			}
		})
	}

	hostDisconnected() {
		this.#subscription?.unsubscribe()
	}
}
