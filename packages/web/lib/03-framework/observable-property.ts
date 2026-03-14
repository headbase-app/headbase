import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {Observable, Subscription} from "rxjs";

export interface ObservablePropertyOptions<T> {
	/**
	 * A property on the host to reflect the latest observable value to.
	 */
	reflectedProperty?: string
	/**
	 * A callback to run when the observable pushes a new value.
	 */
	onChange?: (next: T) => void
}

export class ObservableProperty<T> implements ReactiveController {
	#host: ReactiveControllerHost
	observable: Observable<T>
	value!: T
	#subscription?: Subscription
	#options?: ObservablePropertyOptions<T>

	constructor(host: ReactiveControllerHost, observable: Observable<T>, options?: ObservablePropertyOptions<T>) {
		this.#host = host;
		this.observable = observable;
		this.#options = options
		this.#host.addController(this);
	}

	hostConnected() {
		this.#subscription = this.observable.subscribe(next => {
			this.value = next

			if (this.#options?.reflectedProperty) {
				// @ts-expect-error -- this is dynamic by design so can't statically resolve index typing.
				this.#host[this.#options.reflectedProperty] = next;
			}

			this.#options?.onChange?.(next)
		})
	}

	hostDisconnected() {
		this.#subscription?.unsubscribe()
	}
}
