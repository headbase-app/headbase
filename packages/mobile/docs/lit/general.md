# General
The app is built using [Lit](https://lit.dev/) (web components) and similar "vanilla-ish" technologies.

Lit isn't the smoothest or easiest way of building a full web app when compared to alternatives like Svelte, Solid, React etc.
A purposeful tradeoff has been made to sacrifice some simplicity and convenience to stay closer to the native web platform and bet on long-term stability.
Having more direct control at a lower level also makes it easier for features like the Plugin API to allow custom
experiences as there is no need to battle a framework that wants control over the entire state and rendering of the application.

## Key Dependencies
Here are the key dependencies of the application and why they're used:

- **[Vite](https://vite.dev/)**: Provides the foundation for developing and building the app.
- **[Typescript](https://www.typescriptlang.org/) / [ESLint](https://eslint.org/) / [Prettier](https://prettier.io/)**: Provides better developer experience, type-safe code safety etc.
- **[Lit](https://lit.dev/) (& [Lit Context](https://lit.dev/docs/data/context/))**: Provides the core "framework/library" used to build the application and components.
- **[Lucide](https://lucide.dev/)**: Provides great icons.
- **[PDF.js](https://mozilla.github.io/pdf.js/)**: For parsing and rendering PDF documents.
- **[Capacitor](https://capacitorjs.com/)**: Provides all functionality for cross-platform development and integration.

## Reasoning
Reasons for using Lit and "vanilla-ish" technologies:
- To allow for a custom plugin API for app extensibility which doesn't need to work around framework specific considerations.
- Fewer & simpler dependencies reduces the long-term maintenance burden of chasing releases, handling upgrades etc.
- Fewer dependencies reduces the risk of supply chain related issues, attacks etc.
- A general curiosity to experiment with building an app "closer to the web platform".
- As an excuse to gain more experience with newer native web features such as HTMLDialogElement, CSS anchor positioning etc.

This approach does come with some major disadvantages and tradeoffs:
- Harder to create component-based abstractions for decoupling and code reuse due to boilerplate and DX.
- Higher risk of falling into a monolithic mess of code which is harder to reason about, test and change.
- Less smooth and robust integrations into common development and testing tools like Storybook.
- High barrier of entry for external code contributions as less common knowledge, requires more custom architecture and good practises decisions etc.
