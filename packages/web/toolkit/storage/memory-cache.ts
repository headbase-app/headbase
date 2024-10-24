import {ZodTypeAny} from "zod";

interface CacheStore {
	[key: string]: unknown
}

export class MemoryCache {
	private cacheStore: CacheStore

	constructor() {
		this.cacheStore = {}
	}

	async add(key: string, data: unknown): Promise<void> {
		this.cacheStore[key] = data
	}

	hasKey(key: string): boolean {
		return Object.keys(this.cacheStore).includes(key)
	}

	async get<Data>(key: string, schema?: ZodTypeAny): Promise<Data | null> {
		if (this.hasKey(key)) {
			const rawData = this.cacheStore[key]

			if (!schema) {
				return rawData as Data
			}

			const parseResult = schema.safeParse(rawData)
			if (parseResult.success) {
				return parseResult.data
			}
			// If data validation failed, delete the item because it can't be retrieved as expected anyway
			else {
				await this.delete(key)
			}
		}

		return null
	}

	async delete(key: string): Promise<void> {
		const exists = this.hasKey(key)
		if (exists) {
			delete this.cacheStore[key]
		}

		// todo: throw error if item no found?
	}

	async purge() {
		this.cacheStore = {}
	}
}

export const memoryCache = new MemoryCache()
