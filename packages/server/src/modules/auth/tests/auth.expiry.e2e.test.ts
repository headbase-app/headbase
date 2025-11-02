import { describe, expect, test, beforeAll, beforeEach, afterAll } from "@jest/globals";

import { sign } from "jsonwebtoken";

import { TestHelper } from "@testing/test-helper";
import { testAdminUser1, testUser1 } from "@testing/data/users";
import { expectUnauthorized } from "@testing/common/expect-unauthorized";
import { ConfigService } from "@services/config/config.service";
import { DatabaseService } from "@services/database/database.service";
import { sessions } from "@services/database/schema/schema";
import { eq } from "drizzle-orm";
import { AuthService } from "@modules/auth/auth.service";

const testHelper = new TestHelper();
beforeAll(async () => {
	await testHelper.beforeAll();
});
afterAll(async () => {
	await testHelper.afterAll();
});
beforeEach(async () => {
	await testHelper.beforeEach();
});

// todo: remove direct use of DI container?

describe("Session Expiry", () => {
	test("When requesting using an expired session, the session should be removed and request should fail.", async () => {
		const databaseService = testHelper.getAppDependency<DatabaseService>(DatabaseService);
		const db = databaseService.getDatabase();

		const sessionToken = await testHelper.getSessionToken(testUser1.id);

		// Update session expiry to now
		const now = new Date().toISOString();
		await db.update(sessions).set({ expiresAt: now }).where(eq(sessions.token, sessionToken));

		// Using session should fail
		const response = await testHelper.client.get("/v1/auth/check").set("Authorization", `Bearer ${sessionToken}`);
		expect(response.statusCode).toEqual(401);

		// Session should have been removed from database
		const results = await db.select().from(sessions).where(eq(sessions.token, sessionToken));
		expect(results.length).toEqual(0);
	});

	test("When old sessions exist, they should be periodically removed from the database.", async () => {
		const databaseService = testHelper.getAppDependency<DatabaseService>(DatabaseService);
		const db = databaseService.getDatabase();

		const sessionToken = await testHelper.getSessionToken(testUser1.id);
		const sessionTokenUser2 = await testHelper.getSessionToken(testAdminUser1.id);

		// Update session expiry to now
		const now = new Date().toISOString();
		await db.update(sessions).set({ expiresAt: now }).where(eq(sessions.token, sessionToken));

		// Manually trigger cron job which removes old sessions
		const authService = testHelper.getAppDependency<AuthService>(AuthService);
		await authService.removeOldSessions();

		// Session should have been removed from database
		const results = await db.select().from(sessions).where(eq(sessions.token, sessionToken));
		expect(results.length).toEqual(0);

		// Session for other users should still exist
		const results2 = await db.select().from(sessions).where(eq(sessions.token, sessionTokenUser2));
		expect(results2.length).toEqual(1);
	});
});
