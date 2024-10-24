import globals from "globals";
import pluginJs from "@eslint/js";
import tslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import stylistic from '@stylistic/eslint-plugin'

export default [
	{ files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], },
	{
		ignores: [
			'dist/'
		],
	},
	{ languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
	{languageOptions: { globals: globals.browser }},
	pluginJs.configs.recommended,
	...tslint.configs.recommended,
	pluginReactConfig,
	{plugins: {'@stylistic': stylistic}},
	{
		rules: {
			"react/react-in-jsx-scope": "off",
			"@stylistic/indent": ["error", "tab"]
		}
	}
];