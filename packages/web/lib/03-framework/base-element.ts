import {BehaviorSubject, isObservable, Observable, skip, Subject, type Subscription, takeUntil} from "rxjs";

const unsubscribe = Symbol('unsubscribe');

export interface ReflectObservableOptions {
	disableRenderUpdate?: boolean
}

/**
 * A base element providing support for
 *
 * Thanks to https://adrianfaciu.dev/posts/observables-litelement for approach for observable handling.
 */
export abstract class BaseElement extends HTMLElement {
	[unsubscribe] = new Subject();

	connectedCallback() {
		this.render()
	}
	disconnectedCallback() {
		this[unsubscribe].complete();
	}
	render() {}

	observedState<T>(
		initialValue: T,
		observable$?: Observable<T>,
		options?: ReflectObservableOptions
	) {
		if (observable$ && !isObservable(observable$)) throw new Error('Provided value is not an observable');

		const subject = new BehaviorSubject<T>(initialValue);

		// If an existing observable is supplied, subscribe the subject
		if (observable$) {
			observable$.subscribe(subject).add(this[unsubscribe]);
		}

		// Subscribe to the subject to re-render the component when an observable changes.
		subject
			// Skip the initialValue emit as this will trigger a render before all component constructor logic is run.
			// We still want BehaviorSubject.value so can't use RelaySubject/Subject here.
			.pipe(skip(1))
			.subscribe((next) => {
				console.debug("observedState next", next);
				if (!options?.disableRenderUpdate) {
					this.render()
				}
		}).add(this[unsubscribe]);

		return subject
	}
}
