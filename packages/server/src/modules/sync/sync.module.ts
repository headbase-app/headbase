import { forwardRef, Module } from "@nestjs/common";
import { ServicesModule } from "@services/services.module.js";
import { AuthModule } from "@modules/auth/auth.module.js";
import { SyncHttpController } from "@modules/sync/sync.controller.js";
import { SyncService } from "@modules/sync/sync.service.js";
import { VaultsModule } from "@modules/vaults/vaults.module.js";

@Module({
	imports: [ServicesModule, forwardRef(() => AuthModule), VaultsModule],
	controllers: [SyncHttpController],
	providers: [SyncService],
})
export class SyncModule {}
