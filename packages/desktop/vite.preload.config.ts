import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        lib: {
            entry: 'src/preload.ts',
            fileName: () => `[name].mjs`,
            formats: ['es']
        }
    }
});
