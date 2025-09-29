import * as z from "zod"


export class KeyValueStoreService {
	async get<Schema>(key: string, schema: z.ZodType<Schema>): Promise<Schema|null> {
		const rawString = localStorage.getItem(key);
		if (rawString) {
			try {
				const rawObject = JSON.parse(rawString);
				return schema.parse(rawObject.value)
			}
			catch (e) {
				console.error(`General storage item ${key} failed validation`)
				console.error(e)
				return null;
			}
		}

		return null;
	}

	async save(key: string, data: unknown): Promise<void> {
		// Always wrap value with json object so JSON.parse can be used consistently when loading data.
		localStorage.setItem(key, JSON.stringify({value: data}));
	}

	async delete(key: string): Promise<void> {
		localStorage.removeItem(key);
	}
}
