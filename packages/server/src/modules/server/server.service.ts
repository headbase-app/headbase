import {DatabaseService} from "@services/database/database.service.js";
import {DataStoreService} from "@services/data-store/data-store.service.js";
import {z} from "zod";
import {ServerManagementDatabaseService} from "@modules/server/database/server.database.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {RequestUser} from "@common/request-context.js";

export type HealthStatus = "ok" | "degraded" | "error"

export interface HealthCheckResult {
    status: HealthStatus
    services: {
        database: HealthStatus
        dataStore: HealthStatus
    }
}

export const ServerSettingsDto = z.object({
    registrationEnabled: z.boolean(),
    createdAt: z.string().datetime()
}).strict()
export type ServerSettingsDto = z.infer<typeof ServerSettingsDto>

export const UpdateServerSettingsDto = ServerSettingsDto
    .omit({createdAt: true})
export type UpdateServerSettingsDto = z.infer<typeof UpdateServerSettingsDto>

export class ServerManagementService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly dataStoreService: DataStoreService,
        private readonly accessControlService: AccessControlService,
        private readonly serverManagementDatabaseService: ServerManagementDatabaseService
    ) {}

    async runHealthCheck(): Promise<HealthCheckResult> {
        const databaseStatus = await this.databaseService.healthCheck()
        const dataStoreStatus = await this.dataStoreService.healthCheck()
        const allStatuses = [databaseStatus, dataStoreStatus]

        let overallStatus: HealthStatus
        if (allStatuses.includes("error")) {
            overallStatus = "error"
        }
        else if (allStatuses.includes("degraded")) {
            overallStatus = "degraded"
        }
        else {
            overallStatus = "ok"
        }

        return {
            status: overallStatus,
            services: {
                database: databaseStatus,
                dataStore: dataStoreStatus,
            }
        }
    }

    async _UNSAFE_getSettings(): Promise<ServerSettingsDto> {
        let settings = await this.serverManagementDatabaseService.getSettings()

        // Populate default settings if they don't already exist.
        if (!settings) {
            settings = await this.serverManagementDatabaseService.updateSettings({registrationEnabled: false})
        }

        return settings
    }

    async getSettings(requestUser: RequestUser): Promise<ServerSettingsDto> {
        await this.accessControlService.validateAccessControlRules({
            requestingUserContext: requestUser,
            unscopedPermissions: ["server-settings:retrieve"],
            // todo: update access control handling to not require targetUserId and/or userScopedPermissions
            targetUserId: requestUser.id,
            userScopedPermissions: [],
        });

        return this._UNSAFE_getSettings()
    }

    async updateSettings(requestUser: RequestUser, updateServerSettingsDto: UpdateServerSettingsDto): Promise<ServerSettingsDto> {
        await this.accessControlService.validateAccessControlRules({
            requestingUserContext: requestUser,
            unscopedPermissions: ["server-settings:update"],
            // todo: update access control handling to not require targetUserId and/or userScopedPermissions
            targetUserId: requestUser.id,
            userScopedPermissions: [],
        });

        return this.serverManagementDatabaseService.updateSettings(updateServerSettingsDto)
    }
}
