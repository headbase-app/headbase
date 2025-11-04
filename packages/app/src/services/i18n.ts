import enTranslations from "../../translations/en.json";
import esTranslations from "../../translations/es.json";

const translations = {
	en: enTranslations,
	es: esTranslations,
} as const


export class I18nService {
	currentLanguage: string;
	fallbackLanguage: string;

	constructor() {
		this.currentLanguage = "en";
		this.fallbackLanguage = "en";
	}

	async init() {}

	t(translationKey: string) {
		// @ts-ignore
		if (translations[this.currentLanguage] && translations[this.currentLanguage][translationKey]) {
			// @ts-ignore
			return translations[this.currentLanguage][translationKey];
		}

		// @ts-ignore
		if (translations[this.fallbackLanguage] && translations[this.fallbackLanguage][translationKey]) {
			// @ts-ignore
			return translations[this.fallbackLanguage][translationKey];
		}

		return translationKey
	}
}
