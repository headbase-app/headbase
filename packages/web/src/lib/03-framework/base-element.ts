import {nothing, type TemplateResult, render} from "lit-html";
import {BehaviorSubject, isObservable, Observable, skip, Subject} from "rxjs";

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
		this.requestUpdate()
	}
	disconnectedCallback() {
		this[unsubscribe].complete();
	}

	render(): TemplateResult | typeof nothing {
		return nothing
	}

	requestUpdate() {
		this.update()
		const template = this.render()
		render(template, this)
	}
	update() {}

	createState<T>(
		initialValue: T,
		observable$?: Observable<T>,
		options?: ReflectObservableOptions
	) {
		if (observable$ && !isObservable(observable$)) throw new Error('Provided value is not an observable');

		const subject = new BehaviorSubject<T>(initialValue);

		// If an existing observable is supplied, subscribe the subject to this observable.
		if (observable$) {
			observable$.subscribe(subject).add(this[unsubscribe]);
		}

		// Unless opted out, subscribe to re-render the component when the subject changes.
		// The initial BehaviorSubject emit is skipped to avoid triggering a render to early before all component
		// constructor logic is run.
		// todo: does this indicate that components should have a custom lifecycle?
		// for example: .render returns a TemplateResult, the base class is then responsible for rendering to the DOM and
		// can also implement a lifecycle to prevent renders before a flag is set in connectedCallback.
		// Components would then call a function such as .requestRender/.update/.requestUpdate
		if (!options?.disableRenderUpdate) {
			subject
				.pipe(skip(1))
				.subscribe(() => {this.requestUpdate()}).add(this[unsubscribe]);
		}

		return subject
	}
}
