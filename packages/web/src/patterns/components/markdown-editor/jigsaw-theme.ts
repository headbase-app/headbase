import { createTheme, CreateThemeOptions } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
export const themeOptions: CreateThemeOptions = {
	theme: "dark",
	settings: {
		background: "transparent",
		foreground: "#cccccc",
		caret: "#0c857a",
		selection: "var(--j-c-atom-200)",
		selectionMatch: "#242830",
		gutterBackground: "#242830",
		gutterForeground: "#5e6878",
		gutterBorder: "#5e6878",
		gutterActiveForeground: "#0c857a",
		lineHighlight: "#242830",
	},
	styles: [
		{ tag: t.comment, color: "#5e6878" },
		{ tag: t.lineComment, color: "#5e6878" },
		{ tag: t.blockComment, color: "#5e6878" },
		{ tag: t.docComment, color: "#50915f" },
		{ tag: t.name, color: "#cccccc" },
		{ tag: t.definition(t.typeName), color: "#cccccc" },
		{ tag: t.typeName, color: "#e79155" },
		{ tag: t.standard(t.typeName), color: "#e79155" },
		{ tag: t.tagName, color: "#50915f" },
		{ tag: t.standard(t.tagName), color: "#649d71" },
		{ tag: t.variableName, color: "#cccccc" },
		{ tag: t.definition(t.variableName), color: "#cccccc" },
		{ tag: t.function(t.variableName), color: "#e281b1" },
		{ tag: t.propertyName, color: "#e281b1" },
		{ tag: t.function(t.propertyName), color: "#9d7ee5" },
		{ tag: t.definition(t.propertyName), color: "#4998c0" },
		{ tag: t.special(t.propertyName), color: "#cccccc" },
		{ tag: t.attributeName, color: "#4998c0" },
		{ tag: t.className, color: "#cccccc" },
		{ tag: t.constant(t.className), color: "#cccccc" },
		{ tag: t.labelName, color: "#cccccc" },
		{ tag: t.namespace, color: "#e79155" },
		{ tag: t.macroName, color: "#cccccc" },
		{ tag: t.literal, color: "#50915f" },
		{ tag: t.string, color: "#50915f" },
		{ tag: t.docString, color: "#50915f" },
		{ tag: t.attributeValue, color: "#cccccc" },
		{ tag: t.number, color: "#50915f" },
		{ tag: t.keyword, color: "#e79155" },
		{ tag: t.self, color: "#e79155" },
		{ tag: t.atom, color: "#cccccc" },
		{ tag: t.unit, color: "#cccccc" },
		{ tag: t.definitionKeyword, color: "#e79155" },
		{ tag: t.paren, color: "#cccccc" },
		{ tag: t.content, color: "#cccccc" },
		{ tag: t.heading1, color: "#eeeeee", class: "h h1" },
		{ tag: t.heading2, color: "#eeeeee", class: "h h2" },
		{ tag: t.heading3, color: "#eeeeee", class: "h h3" },
		{ tag: t.heading4, color: "#eeeeee", class: "h h4" },
		{ tag: t.heading5, color: "#eeeeee", class: "h h5" },
		{ tag: t.heading6, color: "#eeeeee", class: "h h6" },
		{ tag: t.contentSeparator, color: "#cccccc" },
		{ tag: t.list, color: "#eeeeee", class: "li" },
		{ tag: t.quote, color: "#eeeeee", class: "quote" },
		{ tag: t.emphasis, color: "#eeeeee", class: "em" },
		{ tag: t.strong, color: "#eeeeee", class: "strong" },
		{ tag: t.link, color: "#0c857a", class: "link" },
		{ tag: t.monospace, color: "#eeeeee", className: "code" },
		{ tag: t.strikethrough, color: "#5e6878" },
		{ tag: t.invalid, color: "#e55c5c" },
	],
};

export const jigsawTheme = createTheme(themeOptions);
