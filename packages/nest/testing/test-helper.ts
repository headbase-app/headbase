import { agent } from "supertest";
import TestAgent from "supertest/lib/agent";
import { Server } from "node:http";
import { INestApplication } from "@nestjs/common";

import { TokenPair } from "@headbase-app/contracts";

import { ConfigService } from "@services/config/config.service";
import { UsersService } from "@modules/users/users.service";
import { TokenService } from "@services/token/token.service";
import { DatabaseService } from "@services/database/database.service";
import { CacheStoreService } from "@services/cache-store/cache-store.service";
import { ServerManagementService } from "@modules/server/server.service";
import { resetTestData, ScriptOptions } from "./database-scripts";
import { createApp } from "../src/create-app";

export class TestHelper {
	private application!: INestApplication<Server>;
	public client!: TestAgent;
	public server!: Server;

	async beforeAll() {
		this.application = await createApp({ logger: false });
		await this.application.init();

		this.server = this.application.getHttpServer();

		// Overwrite the email mode to silence output and prevent actual email sending during test runs.
		const configService = this.application.get(ConfigService);
		configService.vars.email.sendMode = "silent";

		// Setup supertest agent for test requests
		this.client = agent(this.server);
	}

	getAppDependency<T>(dependency: any): T {
		return this.application.get<T>(dependency);
	}

	/**
	 * Return a token pair for the given user.
	 *
	 * @param userId
	 */
	async getUserTokens(userId: string): Promise<TokenPair> {
		const userService = this.application.get(UsersService);
		const tokenService = this.application.get(TokenService);

		const user = await userService._UNSAFE_getById(userId);
		const createdTokenPair = await tokenService.createNewTokenPair(user);
		return createdTokenPair.tokens;
	}

	/**
	 * Return an access token for the given user.
	 *
	 * @param userId
	 */
	async getUserAccessToken(userId: string): Promise<string> {
		const tokenPair = await this.getUserTokens(userId);
		return tokenPair.accessToken;
	}

	getEmailVerificationToken(userId: string): string {
		const envService = this.application.get(ConfigService);
		const tokenService = this.application.get(TokenService);

		return tokenService.getActionToken({
			userId: userId,
			actionType: "verify-email",
			secret: envService.vars.auth.emailVerification.secret,
			expiry: envService.vars.auth.emailVerification.expiry,
		});
	}

	/**
	 * Reset the db to match the predefined test content.
	 */
	async resetDatabaseData(options?: ScriptOptions) {
		const databaseService = this.application.get(DatabaseService);
		const sql = databaseService.getSQL();
		await resetTestData(sql, {
			logging: options?.logging || false,
			// Default to skipping populating items which dramatically increases test performance due to amount of test items
			seedItems: !!options?.seedItems,
		});
	}

	/**
	 * Kill the application gracefully, making sure all modules clean up as expected.
	 */
	async killApplication() {
		const databaseService = this.application.get(DatabaseService);
		const dataStoreService = this.application.get(CacheStoreService);

		// Clean up db connection before exiting
		await databaseService.onModuleDestroy();
		dataStoreService.onModuleDestroy();
	}

	async beforeEach(options?: ScriptOptions) {
		await this.resetDatabaseData(options);

		// Overwrite server settings to ensure tests are consistent
		// todo: this change will persist after tests. Should this be done via some sort of mocking or override to bypass the database?
		const serverManagementDatabaseService = this.application.get(ServerManagementService);
		await serverManagementDatabaseService._UNSAFE_updateSettings({
			registrationEnabled: true,
		});

		// Purge the data store to ensure things like refresh/access tokens aren't persisted
		const dataStoreService = this.application.get(CacheStoreService);
		await dataStoreService.purge();
	}

	async afterAll() {
		await this.killApplication();
	}
}
