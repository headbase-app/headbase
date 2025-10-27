import { Module } from "@nestjs/common";
import { ServerManagementService } from "@modules/server/server.service";
import { ServerManagementHttpController } from "@modules/server/server.controller";
import { ServicesModule } from "@services/services.module";
import { AuthModule } from "@modules/auth/auth.module";

@Module({
	imports: [ServicesModule, AuthModule],
	controllers: [ServerManagementHttpController],
	providers: [ServerManagementService],
	exports: [ServerManagementService],
})
export class ServerManagementModule {}
