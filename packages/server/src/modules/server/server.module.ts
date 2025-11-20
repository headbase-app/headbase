import { Module } from "@nestjs/common";
import { ServerManagementService } from "@modules/server/server.service.js";
import { ServerManagementHttpController } from "@modules/server/server.controller.js";
import { ServicesModule } from "@services/services.module.js";
import { AuthModule } from "@modules/auth/auth.module.js";

@Module({
	imports: [ServicesModule, AuthModule],
	controllers: [ServerManagementHttpController],
	providers: [ServerManagementService],
	exports: [ServerManagementService],
})
export class ServerManagementModule {}
