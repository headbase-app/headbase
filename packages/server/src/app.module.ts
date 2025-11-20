import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { ServicesModule } from "@services/services.module.js";
import { BaseModule } from "@modules/base/base.module.js";
import { ServerManagementModule } from "@modules/server/server.module.js";
import { AuthModule } from "@modules/auth/auth.module.js";
import { UsersModule } from "@modules/users/users.module.js";
import { VaultsModule } from "@modules/vaults/vaults.module.js";
import { FilesModule } from "@modules/files/files.module.js";
import { ChunksModule } from "@modules/chunks/chunks.module.js";

@Module({
	imports: [ServicesModule, BaseModule, ServerManagementModule, AuthModule, UsersModule, VaultsModule, FilesModule, ChunksModule, ScheduleModule.forRoot()],
})
export class AppModule {}
