import {isObservable, type Observable, Subject, type Subscription, takeUntil} from "rxjs";

const unsubscribe = Symbol('unsubscribe');
const subscriptions = Symbol('subscriptions');

interface StoredSubscription {
	observable$?: Observable<unknown>;
	subscription?: Subscription;
}

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
	[subscriptions] = new Map<keyof this, StoredSubscription>();

	connectedCallback() {
		this.render()
	}
	disconnectedCallback() {
		this[unsubscribe].complete();
	}
	render() {}

	reflectObservable<Key extends keyof this>(
		property: Key,
		observable$: Observable<this[Key]>,
		options?: ReflectObservableOptions
	) {
		if (!this.hasOwnProperty(property)) throw new Error('Invalid property name');
		if (!isObservable(observable$)) throw new Error('Invalid Observable!');

		const existingSubscription = this[subscriptions].get(property);
		if (existingSubscription) {
			if (existingSubscription?.observable$ === observable$) return;
			else existingSubscription?.subscription?.unsubscribe();
		}
		const subscription = observable$
			.pipe(takeUntil(this[unsubscribe]))
			.subscribe(value => {
				this[property] = value;

				if (!options?.disableRenderUpdate) {
					this.render();
				}
			})

		this[subscriptions].set(property, { observable$, subscription });
	}
}
