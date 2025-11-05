# Implementation
The web application is built using "vanilla-ish" technologies with minimal dependencies, so no front-end framework!
This crazy choice was made for a few reasons:
- To allow for a custom plugin API for app extensibility which doesn't need to work around framework specific considerations.
- Fewer dependencies reduces the long-term maintenance burden of chasing releases, handling upgrades etc.
- Fewer dependencies reduces the risk of supply chain related issues, attacks etc.
- A general curiosity to experiment with building an app in this way.
- As an excuse to gain more experience with newer web features such as HTMLDialogElement, CSS anchor positioning etc.

This approach does come with some major disadvantages and tradeoffs:
- No out-of-the-box reactivity/state primitives or declarative rendering patterns popular in all modern frameworks (`v = f(s)`).
- No easy component-based abstractions for decoupling and code reuse.
- Very high risk of falling into a monolithic mess of imperative code which is hard to reason about, test and change.
- High barrier of entry for external code contributions as little common knowledge, no established good practises etc.

In the end, the decision to build "vanilla-ish" can only really be made because this is a one-person project where I can
have complete control over architecture and implementation decisions.
I don't have to collaborate on the same code, have a very clear idea of the application and features which I can develop to, and frankly am just personally curious to
experiment with this approach.

I'm not a complete purist though, this project is far from raw Javascript with no dependencies at all. Here are the main ones and why they're used:
- **[Vite](https://vite.dev/)**: Provides the core foundation for developing and building the app.
- **[Typescript](https://www.typescriptlang.org/) / [ESLint](https://eslint.org/) / [Prettier](https://prettier.io/)**: Provides good developer experience and safety net, especially writing type-safe code.
- **[lit-html](https://www.npmjs.com/package/lit-html)**: Dramatically improves working with the DOM, reducing boilerplate and allowing for selective and declarative updates (basically the main cheat which makes "no framework" at all possible).
- **[Lucide](https://lucide.dev/)**: Provides great icons.
- **[PDF.js](https://mozilla.github.io/pdf.js/)**: For parsing and rendering PDF documents.
- **[Capacitor](https://capacitorjs.com/)**: Provides all functionality for cross-platform development.

## Common UI Patterns
How are common UI patterns/recipes implemented while relying on as few external packages as possible?

### Dialogs
The `dialog` element ([HTMLDialogElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement)) can
be used for dialog behaviours, with no external dependencies required.

**Extra information**:
- The dialog can be activated via `HTMLDialogElement.show()` or `HTMLDialogElement.showDialog()`
- The dialog doesn't completely focus trap and the user can still access browser controls. This is expected, see discussion on: https://github.com/whatwg/html/issues/8339.

### Tooltips / Context Menus / Popovers etc
The [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using) can be used to implement tooltips.

Popover positioning can be done via [CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning).
As of 04 Nov 2025 this feature is not yet available in stable Firefox, so options are to either:
- Use a polyfill like https://github.com/oddbird/css-anchor-positioning
- Enable Firefox flag `layout.css.anchor-positioning.enabled` in `about:config`

The desktop app uses Electron, so firefox is not relevant there and Android/iOS use capacitor which renders
to the platform web view. TBC if CSS anchor positioning works there, but the web app requires polyfill or the Firefox flag.

### Forms

