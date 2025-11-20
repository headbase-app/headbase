import { Sql } from "postgres";
import { exampleUser1, testAdminUser1, testAdminUser2Unverified, testUser1, testUser2Unverified } from "./data/users.js";
import { testAdminUser1Vault1, testUser1Vault1, testUser1Vault2 } from "./data/vaults.js";

export interface ScriptOptions {
	logging: boolean;
	seedItems?: boolean;
}

/**
 * Reset the database to match the predefined test content
 */
export async function resetTestData(sql: Sql<any>, options?: ScriptOptions) {
	if (options?.logging) {
		console.log("Running database reset");
	}

	await clearTestData(sql, options);
	await seedTestData(sql, options);
}

/**
 * Clear the given database of all test data
 */
export async function clearTestData(sql: Sql<any>, options?: ScriptOptions) {
	if (options?.logging) {
		console.log("Running database clear");
	}

	// Deleting users will cascade delete all related data so we don't need to specifically delete everything.
	for (const user of [testUser1, testUser2Unverified, testAdminUser1, testAdminUser2Unverified]) {
		await sql`DELETE FROM users where id = ${user.id}`;
	}

	// Delete example user by email, as they will be created with a random id
	for (const user of [exampleUser1]) {
		await sql`DELETE FROM users where email = ${user.email}`;
	}

	if (options?.logging) {
		console.log("Database clear completed");
	}
}

/**
 * Seed the given database with the predefined test content
 */
export async function seedTestData(sql: Sql<any>, options?: ScriptOptions) {
	if (options?.logging) {
		console.log("Running database seed");
	}

	for (const testUser of [testUser1, testUser2Unverified, testAdminUser1, testAdminUser2Unverified]) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = testUser;
		await sql`insert into users ${sql([user])}`;
	}

	for (const vault of [testUser1Vault1, testUser1Vault2, testAdminUser1Vault1]) {
		await sql`insert into vaults ${sql([vault])}`;
	}

	if (options?.logging) {
		console.log("Database seed completed");
	}
}
