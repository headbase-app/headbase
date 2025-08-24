import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        lib: {
            entry: 'src/renderer.ts',
            fileName: () => `[name].mjs`,
            formats: ['es']
        }
    }
});
