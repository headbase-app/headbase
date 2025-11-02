import { z } from "zod";
import { Injectable } from "@nestjs/common";

import { ServerInfoDto } from "@headbase-app/contracts";

import { DatabaseService } from "@services/database/database.service";
import { UserContext } from "@common/request-context";
import { SystemError } from "@services/errors/base/system.error";
import { settings } from "@services/database/schema/schema";
import { ObjectStoreService } from "@services/object-store/object-store.service";
import { AuthService } from "@modules/auth/auth.service";

export type HealthStatus = "ok" | "degraded" | "error";

// todo: should be in contracts package?
export interface HealthCheckResult {
	status: HealthStatus;
	services: {
		database: HealthStatus;
		objectStore: HealthStatus;
	};
}

export const ServerSettingsDto = z
	.object({
		registrationEnabled: z.boolean(),
		createdAt: z.string().datetime(),
	})
	.strict();
export type ServerSettingsDto = z.infer<typeof ServerSettingsDto>;

export const UpdateServerSettingsDto = ServerSettingsDto.omit({ createdAt: true });
export type UpdateServerSettingsDto = z.infer<typeof UpdateServerSettingsDto>;

@Injectable()
export class ServerManagementService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly objectStoreService: ObjectStoreService,
		private readonly authService: AuthService,
	) {}

	async runHealthCheck(): Promise<HealthCheckResult> {
		const databaseStatus = await this.databaseService.healthCheck();
		const objectStoreStatus = await this.objectStoreService.healthCheck();
		const allStatuses = [databaseStatus, objectStoreStatus];

		let overallStatus: HealthStatus;
		if (allStatuses.includes("error")) {
			overallStatus = "error";
		} else if (allStatuses.includes("degraded")) {
			overallStatus = "degraded";
		} else {
			overallStatus = "ok";
		}

		return {
			status: overallStatus,
			services: {
				database: databaseStatus,
				objectStore: objectStoreStatus,
			},
		};
	}

	async getInfo(): Promise<ServerInfoDto> {
		const settings = await this._UNSAFE_getSettings();

		return {
			version: "v1",
			registrationEnabled: settings.registrationEnabled,
			limits: {
				// todo: review if/how to implement these size limits.
				usersMaxVaults: 10,
				vaultMaxSize: 10000,
				fileMaxSize: 2000,
			},
		};
	}

	async _UNSAFE_getSettings(): Promise<ServerSettingsDto> {
		const db = this.databaseService.getDatabase();

		let result: ServerSettingsDto[] = [];
		try {
			result = await db.select().from(settings).orderBy(settings?.createdAt).limit(1);
		} catch (e: any) {
			throw ServerManagementService.getContextualError(e);
		}
		if (result[0]) {
			return result[0];
		}

		return this._UNSAFE_updateSettings({ registrationEnabled: false });
	}

	async _UNSAFE_updateSettings(updateDto: UpdateServerSettingsDto): Promise<ServerSettingsDto> {
		const db = this.databaseService.getDatabase();

		let result: ServerSettingsDto[] = [];
		try {
			result = await db.insert(settings).values(updateDto).returning();
		} catch (e: any) {
			throw ServerManagementService.getContextualError(e);
		}
		if (!result[0]) {
			throw new SystemError({ message: "Unexpected error returning settings after update" });
		}

		return result[0];
	}

	async getSettings(userContext: UserContext): Promise<ServerSettingsDto> {
		await this.authService.guardAdminAction(userContext);

		return this._UNSAFE_getSettings();
	}

	async updateSettings(userContext: UserContext, updateDto: UpdateServerSettingsDto): Promise<ServerSettingsDto> {
		await this.authService.guardAdminAction(userContext);

		return this._UNSAFE_updateSettings(updateDto);
	}

	private static getContextualError(e: any) {
		return new SystemError({
			message: "Unexpected error while creating server settings",
			cause: e,
		});
	}
}
