/*
Can't currently use .ts file due to Vite using a very old postcss-load-config version:
https://github.com/vitejs/vite/issues/15869
https://github.com/vitejs/vite/issues/17595
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
