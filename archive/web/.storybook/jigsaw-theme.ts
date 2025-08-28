import { create } from "@storybook/theming";

export default create({
	base: "dark",
	brandTitle: "Headbase",
	brandUrl: "https://github.com/headbase-app/headbase",
	brandTarget: "_self",

	// Main Colours
	colorPrimary: "#0c857a",
	colorSecondary: "#0c857a",

	// UI
	appBg: "#2b303b",
	appContentBg: "#242830",
	appBorderColor: "#454f5f",
	appBorderRadius: 4,

	// Typography
	fontBase: '"Open Sans", sans-serif',
	fontCode: "monospace",

	// Text colors
	textColor: "#ccc",
	textInverseColor: "#ccc",

	// Toolbar default and active colors
	barTextColor: "#ccc",
	barSelectedColor: "#0c857a",
	barBg: "#2b303b",

	// Form colors
	inputBg: "white",
	inputBorder: "silver",
	inputTextColor: "black",
	inputBorderRadius: 4,
});
