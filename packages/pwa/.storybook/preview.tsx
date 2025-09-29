export const parameters = {
	actions: { argTypesRegex: "^on[A-Z].*" },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
	options: {
		showPanel: false,
		storySort: {
			order: [],
		},
	},
	backgrounds: {
		default: "jigsaw",
		values: [
			{
				name: "jigsaw",
				value: "#242830",
			},
		],
	},
};
