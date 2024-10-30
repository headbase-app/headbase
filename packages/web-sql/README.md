

Links:
- https://sqlite.org/wasm/doc/trunk/api-worker1.md#promiser.v2
- https://sqlite.org/wasm/doc/trunk/api-oo1.md#db-exec
- https://sqlite.org/lang.html
- https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system/
- https://github.com/sqlite/sqlite-wasm/issues/53
- https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system
- https://github.com/rhashimoto/wa-sqlite/discussions/81
- https://www.notion.so/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite


todo:
- look at dev tools for debugging databases (at schema and data level)
 - add export functionality for user to download sqlite file from opfs. Likely via loading file and creating file blob to download
 - how to manage schemas? Could define or copy externally from JS to allow integrations with IDE, debugging tools and native sqlite tooling outside web browser?
- look at how to manage db init, resuming from previous db, handling migrations etc
- look at how to detect and handle OPFS and/or WASM not being available in users browser
- test performance with lots of rows and large data fields.
- look at ability to handle multiple databases, and how cross tab and cross window can work together
- look at accessing sqlite from within custom shared worker, which would be required for reading & writing during network sync

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
