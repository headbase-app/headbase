# Common Patterns
How are common UI patterns/recipes implemented while relying on as few external packages as possible?

## Code Patterns
- Methods should be private `#method` wherever possible and where not possible (like decorated internal properties) use `private _method` instead.
- Method dispatching events should be named `#dispatchX` and methods handling an event should be called `#onX`

## UI Components

### Dialogs
The `dialog` element ([HTMLDialogElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement)) can
be used for dialog behaviours, with no external dependencies required.

**Extra information**:
- The dialog can be activated via `HTMLDialogElement.show()` or `HTMLDialogElement.showDialog()`
- The dialog doesn't completely focus trap and the user can still access browser controls. This is expected, see discussion on: https://github.com/whatwg/html/issues/8339.
- Event listeners added to the host can be done in the constructor without removing as the browser will garbage collect them (https://lit.dev/articles/lit-cheat-sheet/#adding-listeners-to-the-host-element)

### Tooltips / Context Menus / Popovers etc
The [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using) can be used to implement tooltips.

Popover positioning can be done via [CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning).
As of 04 Nov 2025 this feature is not yet available in stable Firefox, so options are to either:
- Use a polyfill like https://github.com/oddbird/css-anchor-positioning
- Enable Firefox flag `layout.css.anchor-positioning.enabled` in `about:config`

The desktop app uses Electron, so firefox is not relevant there and Android/iOS use capacitor which renders
to the platform web view. TBC if CSS anchor positioning works there, but the web app requires polyfill or the Firefox flag.

### Forms

