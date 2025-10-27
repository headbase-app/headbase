import { VaultDto } from "@headbase-app/contracts";
import { testAdminUser1, testUser1 } from "./users";

/**
 * Test vaults.
 * These can be used to for any testing, and will be seeded before every test run.
 */

export const testUser1Vault1: VaultDto = {
	id: "ad5a85d1-86db-477e-af04-19033ef9c53e",
	ownerId: testUser1.id,
	name: "testUser1Vault1",
	protectedEncryptionKey: "protectedEncryptionKey",
	protectedData: "protectedData",
	createdAt: "2022-07-11T18:17:43.784Z",
	updatedAt: "2022-07-11T18:20:32.482Z",
	deletedAt: null,
};

export const testUser1Vault2: VaultDto = {
	id: "c5367e62-ce94-4a14-950e-297a68bbf73b",
	ownerId: testUser1.id,
	name: "testUser1Vault2",
	protectedEncryptionKey: "protectedEncryptionKey",
	protectedData: null,
	createdAt: "2022-07-11T18:17:43.784Z",
	updatedAt: "2022-07-11T18:20:32.482Z",
	deletedAt: null,
};

export const testAdminUser1Vault1: VaultDto = {
	id: "41eecc22-a0b6-4734-96be-e4003ea7132d",
	ownerId: testAdminUser1.id,
	name: "testAdminUser1Vault1",
	protectedEncryptionKey: "protectedEncryptionKey",
	protectedData: "protectedData",
	createdAt: "2022-07-11T18:17:43.784Z",
	updatedAt: "2022-07-11T18:20:32.482Z",
	deletedAt: null,
};

/**
 * Example vaults.
 * These can be used for vault creation tests etc.
 * They will not be seeded before every test, but will be cleaned up if found.
 */

export const exampleVault1: Omit<VaultDto, "ownerId"> = {
	id: "1391d9d5-831b-4f79-93bd-eaf049993162",
	name: "exampleVault1",
	protectedEncryptionKey: "protectedEncryptionKey",
	protectedData: "protectedData",
	createdAt: "2022-07-11T18:17:43.784Z",
	updatedAt: "2022-07-11T18:20:32.482Z",
	deletedAt: null,
};
