
export interface TranslationObject {
	[key: string]: string
}


export interface TranslateFunctionVars {
	[key: string]: string | number | boolean | null
}

export interface ITranslationsAPI {
	t: (text: string, vars?: TranslateFunctionVars) => string
	addTranslations: (language: string, translations: TranslationObject) => void
	setLanguage: (language: string) => void
	getLanguage: () => void
}
