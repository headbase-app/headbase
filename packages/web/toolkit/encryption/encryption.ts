import { z } from "zod";
import { ErrorTypes, HeadbaseError } from "../control-flow";

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

/**
 *
 * Thanks to the following resources which were used to refine this implementation:
 * - https://github.com/AKASHAorg/easy-web-crypto
 * - https://developer.mozilla.org/en-US/docs/Glossary/Base64
 */
export class HeadbaseEncryption {

	static generateUUID(): string {
		return self.crypto.randomUUID()
	}

	static async createProtectedEncryptionKey(password: string): Promise<CreatedEncryptionKey> {
		const encryptionKey = await HeadbaseEncryption._createEncryptionKey()
		const unlockKey = await HeadbaseEncryption._deriveUnlockKey(password)
		const protectedEncryptionKey = await HeadbaseEncryption._wrapEncryptionKey(encryptionKey, unlockKey)

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
			const rawMetadata = HeadbaseEncryption._base64ToBytes(base64Metadata)
			const metadata = UnlockKeyMetadata.parse(JSON.parse(new TextDecoder().decode(rawMetadata)))
			unlockKey = await HeadbaseEncryption._deriveUnlockKey(password, metadata.salt)
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, originalError: e})
		}

		let encryptionKey: string
		try {
			encryptionKey = await HeadbaseEncryption._decryptWithKey(unlockKey.key, based64WrappedKey)
		}
		catch (e) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_PASSWORD_OR_KEY, originalError: e})
		}

		return encryptionKey
	}

	static async updateProtectedEncryptionKey(protectedEncryptionKey: string, currentPassword: string, newPassword: string): Promise<CreatedEncryptionKey> {
		const encryptionKey = await HeadbaseEncryption.decryptProtectedEncryptionKey(protectedEncryptionKey, currentPassword)
		const newUnlockKey = await HeadbaseEncryption._deriveUnlockKey(newPassword)
		const newProtectedEncryptionKey = await HeadbaseEncryption._wrapEncryptionKey(encryptionKey, newUnlockKey)

		// The stored encryption key doesn't change, but a CreatedEncryptionKey is still returned for consistency with the createProtectedEncryptionKey method.
		return {
			encryptionKey,
			protectedEncryptionKey: newProtectedEncryptionKey
		}
	}

	static async encrypt<T>(encryptionKey: string, data: T): Promise<string> {
		const key = await HeadbaseEncryption._getEncryptionCryptoKey(encryptionKey)
		return HeadbaseEncryption._encryptWithKey(key, data)
	}

	static async decrypt<T>(
		encryptionKey: string,
		ciphertext: string,
		validationSchema?: z.ZodType<T>,
	): Promise<T> {
		const key = await HeadbaseEncryption._getEncryptionCryptoKey(encryptionKey)
		const result = await HeadbaseEncryption._decryptWithKey(key, ciphertext)

		if (!validationSchema) {
			return result as T
		}
		return validationSchema.parse(result)
	}

	static async _createEncryptionKey(): Promise<string> {
		const keyMaterial = window.crypto.getRandomValues(new Uint8Array(32));
		const base64Key = HeadbaseEncryption._bytesToBase64(keyMaterial)
		return `v1.${base64Key}`
	}

	private static _getEncryptionCryptoKey(encryptionKeyString: string): Promise<CryptoKey> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- version isn't used, but may be needed in the future.

		let keyMaterial
		try {
			const [version, base64Key] = encryptionKeyString.split('.')
			keyMaterial = HeadbaseEncryption._base64ToBytes(base64Key)
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
			? HeadbaseEncryption._base64ToBytes(derivationSalt)
			: window.crypto.getRandomValues(new Uint8Array(16));
		const encodedSalt = derivationSalt || HeadbaseEncryption._bytesToBase64(salt)

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
		const base64WrappedKey = await HeadbaseEncryption._encryptWithKey(unlockKey.key, encryptionKey)

		const encodedMetadata = new TextEncoder().encode(JSON.stringify(unlockKey.metadata))
		const base64Metadata = HeadbaseEncryption._bytesToBase64(encodedMetadata)

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
		const base64CipherText = HeadbaseEncryption._bytesToBase64(new Uint8Array(cipherTextBuffer))

		const base64Iv = HeadbaseEncryption._bytesToBase64(iv)

		const metadata: EncryptionMetadata = {
			algo: "AES-GCM",
			iv: base64Iv,
		}
		const encodedMetadata = new TextEncoder().encode(JSON.stringify(metadata))
		const base64Metadata = HeadbaseEncryption._bytesToBase64(encodedMetadata)

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
			const decodedMetadata = HeadbaseEncryption._base64ToBytes(base64Metadata)
			const metadata = EncryptionMetadata.parse(JSON.parse(new TextDecoder().decode(decodedMetadata)))
			cipherText = HeadbaseEncryption._base64ToBytes(base64CipherText)
			iv = HeadbaseEncryption._base64ToBytes(metadata.iv)
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
	 * Convert a Uint8Array into a base64 encoded string.
	 *
	 * @private
	 * @param byteArray
	 */
	private static _bytesToBase64(byteArray: Uint8Array): string {
		const binString = Array.from(byteArray, (byte) =>
			String.fromCodePoint(byte),
		).join("");
		return btoa(binString);
	}

	/**
	 * Convert a base64 encoded string into a Uint8Array.
	 *
	 * @param base64String
	 * @private
	 */
	private static _base64ToBytes(base64String: string): Uint8Array {
		const binString = atob(base64String);
		// @ts-expect-error -- this is copied from MDN (https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem) and does work.
		return Uint8Array.from(binString, (m) => m.codePointAt(0));
	}
}
