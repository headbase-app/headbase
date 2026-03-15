# General
The app is built using vanilla web components with the help of standalone lit-html for declarative rendering and RxJS (Observables) for reactive state.

Web components are not the smoothest or easiest way of building a full application when compared to frameworks like Solid, Svelte, React etc.
The decision to use web components (with carefully selected helpers and tooling) is a tradeoff to sacrifice some simplicity and convenience to stay closer to the native web platform and bet on long-term stability.
Having more direct control of the DOM also makes it easier to develop features like custom plugins as there is no need to battle a framework that wants control over the entire lifecycle and rendering of the application.

## Key Dependencies
Here are the key dependencies of the application and why they're used:

- **[Vite](https://vite.dev/)**: Provides the foundation for developing and building the app.
- **[Typescript](https://www.typescriptlang.org/) / [ESLint](https://eslint.org/) / [Prettier](https://prettier.io/)**: Provides better developer experience, type-safe code etc.
- **[RxJS](https://rxjs.dev/)**: Provides the foundation for modeling reactive state.
- **[lit-html](https://lit.dev/docs/libraries/standalone-templates/)**: Provides the ability to declaratively define and update HTML within web components.
- **[Lucide](https://lucide.dev/)**: Provides great icons.
- **[PDF.js](https://mozilla.github.io/pdf.js/)**: For parsing and rendering PDF documents.

## Reasoning
Reasons for using this web components based approach:
- To allow for a custom plugin API for app extensibility which doesn't need to work around framework specific considerations.
- Fewer & simpler dependencies reduces the long-term maintenance burden of chasing releases, handling upgrades etc.
- Fewer dependencies reduces the risk of supply chain related issues, attacks etc.
- A general curiosity to experiment with this approach and to gain more experience with newer native web features such as HTMLDialogElement, CSS anchor positioning etc.

This approach does come with some major disadvantages and tradeoffs:
- Harder to create component-based abstractions for decoupling and code reuse due to boilerplate and DX.
- Higher risk of falling into a monolithic mess of code which is harder to reason about, test and change.
- Fewer robust integrations into common development and testing tools, such as Storybook.
- High barrier of entry for external code contributions as requires custom knowledge, fewer standardised good practises decisions etc.
