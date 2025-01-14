import {agent, SuperAgentTest} from "supertest";
import {Server} from "node:http";

import {TokenPair} from "@headbase-app/common";

import {resetTestData, ScriptOptions} from "./database-scripts.js";
import {EnvironmentService} from "@services/environment/environment.service.js";
import {UsersService} from "@modules/users/users.service.js";
import {TokenService} from "@services/token/token.service.js";
import {DatabaseService} from "@services/database/database.service.js";
import {DataStoreService} from "@services/data-store/data-store.service.js";
import {Application} from "../src/application.js";
import {ServerManagementService} from "@modules/server/server.service.js";

export class TestHelper {
  private application!: Application;
  public server!: Server;
  public client!: SuperAgentTest;

  async beforeAll() {
    // Create app
    this.application = new Application()
    this.server = await this.application.init()

    // Overwrite the email mode to silence output and prevent actual email sending during test runs.
    const envService = this.application.getDependency<EnvironmentService>(EnvironmentService);
    envService.vars.email.sendMode = "silent"

    // Setup supertest agent for test requests
    this.client = agent(this.server);
  }

  getAppDependency<T>(dependency: any): T {
    return this.application.getDependency<T>(dependency);
  }

  /**
   * Return a token pair for the given user.
   *
   * @param userId
   */
  async getUserTokens(userId: string): Promise<TokenPair> {
    const userService = this.application.getDependency<UsersService>(UsersService);
    const tokenService = this.application.getDependency<TokenService>(TokenService);

    const user = await userService._UNSAFE_getById(userId)
    const createdTokenPair = await tokenService.createNewTokenPair(user);
    return createdTokenPair.tokens
  }


  /**
   * Return an access token for the given user.
   *
   * @param userId
   */
  async getUserAccessToken(userId: string): Promise<string> {
    const tokenPair = await this.getUserTokens(userId);
    return tokenPair.accessToken
  }

  async getEmailVerificationToken(userId: string): Promise<string> {
    const envService = this.application.getDependency<EnvironmentService>(EnvironmentService);
    const tokenService = this.application.getDependency<TokenService>(TokenService);

    return await tokenService.getActionToken({
      userId: userId,
      actionType: "verify-email",
      secret: envService.vars.auth.emailVerification.secret,
      expiry: envService.vars.auth.emailVerification.expiry
    })
  }

  /**
   * Reset the db to match the predefined test content.
   */
  async resetDatabaseData(options?: ScriptOptions) {
    const databaseService = this.application.getDependency<DatabaseService>(DatabaseService);
    const sql = await databaseService.getSQL();
    await resetTestData(sql, {
      logging: options?.logging || false,
      // Default to skipping populating items which dramatically increases test performance due to amount of test items
      seedItems: !!options?.seedItems
    });
  }

  /**
   * Kill the application gracefully, making sure all modules clean up as expected.
   */
  async killApplication() {
    const databaseService = this.application.getDependency<DatabaseService>(DatabaseService);
    const dataStoreService = this.application.getDependency<DataStoreService>(DataStoreService);

    // Clean up db connection before exiting
    await databaseService.onModuleDestroy();
    await dataStoreService.onModuleDestroy();
  }

  async beforeEach(options?: ScriptOptions) {
    await this.resetDatabaseData(options);

    // Overwrite server settings to ensure tests are consistent
    // todo: this change will persist after tests. Should this be done via some sort of mocking or override to bypass the database?
    const serverManagementDatabaseService = this.application.getDependency<ServerManagementService>(ServerManagementService);
    await serverManagementDatabaseService._UNSAFE_updateSettings({registrationEnabled: true})

    // Purge the data store to ensure things like refresh/access tokens aren't persisted
    const dataStoreService = this.application.getDependency<DataStoreService>(DataStoreService);
    await dataStoreService.purge();
  }

  async afterAll() {
    await this.killApplication();
  }
}
