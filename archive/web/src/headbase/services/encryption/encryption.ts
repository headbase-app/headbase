import { z } from "zod";
import { ErrorTypes, HeadbaseError } from "../../control-flow";

// todo: handle errors better, such as re-throwing web crypto errors with extra app specific context?

export const UnlockKeyMetadata = z.object({
	algo: z.literal("PBKDF2"),
	salt: z.string(),
	iterations: z.literal(100000),
	hash: z.literal("SHA-256"),
})
export type UnlockKeyMetadata = z.infer<typeof UnlockKeyMetadata>

export interface UnlockKey {
	key: CryptoKey
	metadata: UnlockKeyMetadata
}

export interface CreatedEncryptionKey {
	protectedEncryptionKey: string
	encryptionKey: string
}

export const EncryptionMetadata = z.object({
	algo: z.literal("AES-GCM"),
	iv: z.string(),
})
export type EncryptionMetadata = z.infer<typeof EncryptionMetadata>

export const HashMetadata = z.object({
	algo: z.literal("SHA-256"),
})
export type HashMetadata = z.infer<typeof HashMetadata>


export class EncryptionService {

	static generateUUID(): string {
		return self.crypto.randomUUID()
	}

	static async createProtectedEncryptionKey(password: string): Promise<CreatedEncryptionKey> {
		const encryptionKey = await EncryptionService._createEncryptionKey()
		const unlockKey = await EncryptionService._deriveUnlockKey(password)
		const protectedEncryptionKey = await EncryptionService._wrapEncryptionKey(encryptionKey, unlockKey)

		return {
			encryptionKey,
			protectedEncryptionKey
		}
	}

	static async decryptProtectedEncryptionKey(protectedEncryptionKey: string, password: string): Promise<string> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- version may be used in future
		const [version, base64Metadata, based64WrappedKey] = protectedEncryptionKey.split(":")

		let unlockKey: UnlockKey
		try {
			const rawMetadata = EncryptionService._hexStringToBytes(base64Metadata)
			const metadata = UnlockKeyMetadata.parse(JSON.parse(new TextDecoder().decode(rawMetadata)))
			unlockKey = await EncryptionService._deriveUnlockKey(password, metadata.salt)
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, originalError: e})
		}

		let encryptionKey: string
		try {
			encryptionKey = await EncryptionService._decryptWithKey(unlockKey.key, based64WrappedKey)
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_PASSWORD_OR_KEY, originalError: e})
		}

		return encryptionKey
	}

	static async updateProtectedEncryptionKey(protectedEncryptionKey: string, currentPassword: string, newPassword: string): Promise<CreatedEncryptionKey> {
		const encryptionKey = await EncryptionService.decryptProtectedEncryptionKey(protectedEncryptionKey, currentPassword)
		const newUnlockKey = await EncryptionService._deriveUnlockKey(newPassword)
		const newProtectedEncryptionKey = await EncryptionService._wrapEncryptionKey(encryptionKey, newUnlockKey)

		// The stored encryption key doesn't change, but a CreatedEncryptionKey is still returned for consistency with the createProtectedEncryptionKey method.
		return {
			encryptionKey,
			protectedEncryptionKey: newProtectedEncryptionKey
		}
	}

	static async encrypt<T>(encryptionKey: string, data: T): Promise<string> {
		const key = await EncryptionService._getEncryptionCryptoKey(encryptionKey)
		return EncryptionService._encryptWithKey(key, data)
	}

	static async hash(data: string): Promise<string> {
		const dataBytes = new TextEncoder().encode(data)
		const resultBytes = await window.crypto.subtle.digest("SHA-256", dataBytes)
		const base64Result = EncryptionService._bytesToHexString(new Uint8Array(resultBytes))

		const metadata: HashMetadata = {
			algo: "SHA-256"
		}
		const encodedMetadata = new TextEncoder().encode(JSON.stringify(metadata))
		const base64Metadata = EncryptionService._bytesToHexString(encodedMetadata)

		return `v1.${base64Metadata}.${base64Result}`
	}

	static async decrypt<T>(
		encryptionKey: string,
		ciphertext: string,
		validationSchema?: z.ZodType<T>,
	): Promise<T> {
		const key = await EncryptionService._getEncryptionCryptoKey(encryptionKey)
		const result = await EncryptionService._decryptWithKey(key, ciphertext)

		if (!validationSchema) {
			return result as T
		}
		return validationSchema.parse(result)
	}

	/**
	 * Create a 256-bit encryption key, which will be returned in the format "<spec-version>.<hex-string>"
	 */
	static async _createEncryptionKey(): Promise<string> {
		const keyMaterial = window.crypto.getRandomValues(new Uint8Array(32));
		const hexString = EncryptionService._bytesToHexString(keyMaterial)
		return `v1.${hexString}`
	}

	private static _getEncryptionCryptoKey(encryptionKeyString: string): Promise<CryptoKey> {
		let keyMaterial
		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars -- version isn't used, but may be needed in the future.
			const [version, base64Key] = encryptionKeyString.split('.')
			keyMaterial = EncryptionService._hexStringToBytes(base64Key)
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, originalError: e})
		}

		return window.crypto.subtle.importKey(
			"raw",
			keyMaterial,
			{
				name: "AES-GCM",
			},
			false,
			["encrypt", "decrypt"]
		)
	}

	private static async _deriveUnlockKey(password: string, derivationSalt?: string): Promise<UnlockKey> {
		const enc = new TextEncoder()

		const baseKey = await window.crypto.subtle.importKey(
			"raw",
			enc.encode(password),
			"PBKDF2",
			false,
			["deriveKey", "deriveBits"]
		)

		const salt = derivationSalt
			? EncryptionService._hexStringToBytes(derivationSalt)
			: window.crypto.getRandomValues(new Uint8Array(16));
		const encodedSalt = derivationSalt || EncryptionService._bytesToHexString(salt)

		const derivedKey = await window.crypto.subtle.deriveKey(
			{
				name: "PBKDF2",
				salt: salt,
				iterations: 100000,
				hash: "SHA-256",
			},
			baseKey,
			{ 'name': 'AES-GCM', 'length': 256 },
			true,
			// Although this key used to wrap the encryption key, the wrapping is done
			// via the _encryptWithKey and _decryptWithKey methods not the SubtleCrypto wrapKey/unwrapKey methods
			// so the key usage just needs to encrypt/decrypt.
			["encrypt", "decrypt"]
		)

		return {
			key: derivedKey,
			metadata: {
				algo: "PBKDF2",
				salt: encodedSalt,
				iterations: 100000,
				hash: "SHA-256"
			}
		}
	}

	private static async _wrapEncryptionKey(encryptionKey: string, unlockKey: UnlockKey): Promise<string> {
		const base64WrappedKey = await EncryptionService._encryptWithKey(unlockKey.key, encryptionKey)

		const encodedMetadata = new TextEncoder().encode(JSON.stringify(unlockKey.metadata))
		const base64Metadata = EncryptionService._bytesToHexString(encodedMetadata)

		return `v1:${base64Metadata}:${base64WrappedKey}`
	}

	private static async _encryptWithKey<T>(key: CryptoKey, data: T): Promise<string> {
		const iv = window.crypto.getRandomValues(new Uint8Array(12));

		const cipherTextBuffer = await window.crypto.subtle.encrypt(
			{
				name: "AES-GCM",
				iv
			},
			key,
			new TextEncoder().encode(JSON.stringify(data))
		)
		const base64CipherText = EncryptionService._bytesToHexString(new Uint8Array(cipherTextBuffer))

		const base64Iv = EncryptionService._bytesToHexString(iv)

		const metadata: EncryptionMetadata = {
			algo: "AES-GCM",
			iv: base64Iv,
		}
		const encodedMetadata = new TextEncoder().encode(JSON.stringify(metadata))
		const base64Metadata = EncryptionService._bytesToHexString(encodedMetadata)

		return `v1.${base64Metadata}.${base64CipherText}`
	}

	/**
	 * Decrypt the ciphertext with the supplied key
	 *
	 * @private
	 * @param key
	 * @param ciphertext
	 */
	private static async _decryptWithKey(
		key: CryptoKey,
		ciphertext: string,
	): Promise<string> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- may be used in future
		const [version, base64Metadata, base64CipherText] = ciphertext.split(".")

		let cipherText: Uint8Array
		let iv: Uint8Array
		try {
			const decodedMetadata = EncryptionService._hexStringToBytes(base64Metadata)
			const metadata = EncryptionMetadata.parse(JSON.parse(new TextDecoder().decode(decodedMetadata)))
			cipherText = EncryptionService._hexStringToBytes(base64CipherText)
			iv = EncryptionService._hexStringToBytes(metadata.iv)
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, originalError: e})
		}

		try {
			const decryptedData = await window.crypto.subtle.decrypt(
				{
					name: "AES-GCM",
					iv,
				},
				key,
				cipherText
			)

			return JSON.parse(new TextDecoder().decode(decryptedData))
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_PASSWORD_OR_KEY, originalError: e})
		}
	}

	/**
	 * Convert a Uint8Array into a hexadecimal string.
	 *
	 * todo: replace with byteArray.toHex() once implemented in browsers
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex
	 *
	 * @private
	 * @param byteArray
	 */
	private static _bytesToHexString(byteArray: Uint8Array): string {
		return Array.from(byteArray, (byte) => {
			return ('0' + (byte & 0xff).toString(16)).slice(-2);
		}).join('');
	}

	/**
	 * Convert a hexadecimal string into a Uint8Array.
	 *
	 * todo: replace with Uint8Array.fromHex() once implemented in browsers
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromHex
	 *
	 * @param hexString
	 * @private
	 */
	private static _hexStringToBytes(hexString: string): Uint8Array {
		const bytes = [];
		for (let c = 0; c < hexString.length; c += 2) {
			bytes.push(parseInt(hexString.substring(c, c + 2), 16));
		}
		return Uint8Array.from(bytes);
	}
}

window.enc = EncryptionService;