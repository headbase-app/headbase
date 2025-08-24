# ESM Support
The desktop repo was created via https://www.electronforge.io/:
```bash
npx create-electron-app@latest desktop --template=vite-typescript
```

That template is not ESM by default, so support was added following these resources:
- https://github.com/electron/forge/issues/3684
- https://stackoverflow.com/questions/78801031/electron-forge-esm/79490871#79490871

1. Set `"type": "module"` in package json
2. Rename `forge.config.ts` to `forge.config.mts`
3. Update vite config files to use ESM for builds (main, preload and renderer)
4. Update `main.ts` to replace `__dirname` with ESM versions
