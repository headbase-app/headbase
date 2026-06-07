# General
The app is built using web components, [lit-html](https://lit.dev/docs/libraries/standalone-templates/) and [RxJS](https://rxjs.dev/) and aims to use "vanilla-ish" technologies.

This isn't the smoothest or easiest way of building an application when compared to front-end frameworks like Svelte, Solid, React etc.
The decision for this tech stack and approach is a purposeful tradeoff which sacrifices some simplicity and developer convenience to stay closer to the native web platform for long-term stability.
Having more direct lower level control also makes it easier to develop features like custom plugins as there is no need to battle a framework that wants control over the entire lifecycle and rendering of the application.

## Key Dependencies
Here are the key dependencies of the application and why they're used:

- **[Vite](https://vite.dev)**: Provides the foundation for developing and building the app.
- **[Typescript](https://www.typescriptlang.org) / [ESLint](https://eslint.org) / [Prettier](https://prettier.io)**: Provides a type-safe and consistent development experience.
- **[lit-html](https://lit.dev/docs/libraries/standalone-templates)**: Provides a way to declaratively render content to the DOM.
- **[RxJS](https://rxjs.dev)**: Provides data reactivity.
- **[Lucide](https://lucide.dev)**: Provides great icons.
- **[PDF.js](https://mozilla.github.io/pdf.js)**: For parsing and rendering PDF documents.
- **[Capacitor](https://capacitorjs.com)**: Provides all functionality for cross-platform development and integration.

## Reasoning
Reasons for using web components and "vanilla-ish" technologies:
- To allow for a plugin API for app extensibility which doesn't need to work around framework specific considerations.
- Fewer dependencies reduces the long-term maintenance burden of chasing library releases, handling upgrades etc.
- Fewer dependencies also reduces the risk of supply chain security issues.
- A general curiosity to experiment with building an app "closer to the web platform".
- As an excuse to gain more experience with newer native web features such as HTMLDialogElement, CSS anchor positioning etc.

This approach does come with some major disadvantages and tradeoffs:
- Harder to create component-based abstractions for decoupling and code reuse due to boilerplate and DX.
- Higher risk of falling into a monolithic mess of code which is harder to reason about, test and change.
- Less smooth and robust integrations into common development and testing tools like Storybook.
- High barrier of entry for external code contributions as requires more custom architecture and good practise decisions etc.
