import type {ITranslationsAPI, TranslateFunctionVars, TranslationObject} from "./translations.api";

export interface TranslationsStore {
	[language: string]: TranslationObject
}

export class CommonTranslationsAPI implements ITranslationsAPI {
	private language: string
	private translationsStore: TranslationsStore = {}

	constructor() {
		this.language = "en"
	}

	setLanguage(language: string) {
		this.language = language
	}
	getLanguage() {
		return this.language
	}

	t(key: string, vars?: TranslateFunctionVars) {
		if (this.translationsStore[this.language] && this.translationsStore[this.language][key]) {
			// todo: find and replace any {{variables}} in the translation key
			return this.translationsStore[this.language][key];
		}

		return key
	}

	addTranslations(language: string, translations: TranslationObject) {
		if (translations[language]) {
			translations[language] = {
				// @ts-ignore
				...translations[language],
				...translations,
			}
		}
		else {
			// @ts-ignore
			translations[language] = translations
		}

	}
}
