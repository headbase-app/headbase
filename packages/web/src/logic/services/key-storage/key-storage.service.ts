
// todo: save to sessionStorage or persist only via memory and broadcast channel?

export class KeyStorageService {
	private static getStorageKey(id: string) {
		return `enckey_${id}`
	}
    
	static async get(id: string) {
		return localStorage.getItem(KeyStorageService.getStorageKey(id))
	}

	static async set(id: string, key: string) {
		localStorage.setItem(KeyStorageService.getStorageKey(id), key)
	}

	static async delete(id: string) {
		localStorage.removeItem(KeyStorageService.getStorageKey(id))
	}
}
