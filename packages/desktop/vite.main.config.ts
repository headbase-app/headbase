import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            fileName: () => `[name].mjs`,
            formats: ['es']
        }
    }
});
