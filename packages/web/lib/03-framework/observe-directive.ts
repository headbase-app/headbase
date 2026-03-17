import {noChange, type TemplateResult, nothing} from "lit-html";
import {AsyncDirective, directive} from 'lit/async-directive.js';
import {Observable, Subscription} from "rxjs";
import type {DirectiveResult} from "lit-html/directive.js";

type ObserveRender<T> = (v: T) => TemplateResult | typeof nothing

class ObserveDirective<T> extends AsyncDirective {
	observable?: Observable<T>;
	subscription?: Subscription;
	observeRender?: ObserveRender<T>

	// When the observable changes, unsubscribe to the old one and subscribe to the new one
	render(observable: Observable<T>, render: ObserveRender<T>) {
		this.observeRender = render;
		if (this.observable !== observable) {
			this.subscription?.unsubscribe();
			this.observable = observable
			if (this.isConnected)  {
				this.subscribe(observable);
			}
		}

		return noChange;
	}

	// Subscribes to the observable, calling the directive's asynchronous setValue API each time the value changes
	subscribe(observable: Observable<T>) {
		this.subscription = observable.subscribe((next: T) => {
			if (this.observeRender) {
				this.setValue(this.observeRender(next));
			}
		});
	}

	// When the directive is disconnected from the DOM, unsubscribe to ensure the directive instance can be garbage collected
	disconnected() {
		this.subscription?.unsubscribe();
	}

	// If the subtree the directive is in was disconnected and subsequently re-connected, re-subscribe to make the directive operable again
	reconnected() {
		this.subscribe(this.observable!);
	}
}

// generic support needs to be manually typed for now (https://github.com/lit/lit/issues/5190)
export const observe = directive(ObserveDirective) as unknown as <T>(
	observable$: Observable<T>,
	render: ObserveRender<T>,
) => DirectiveResult<typeof ObserveDirective>;
