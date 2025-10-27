import { forwardRef, Module } from "@nestjs/common";
import { ServicesModule } from "@services/services.module";
import { AuthModule } from "@modules/auth/auth.module";
import { SyncHttpController } from "@modules/sync/sync.controller";
import { SyncService } from "@modules/sync/sync.service";
import { VaultsModule } from "@modules/vaults/vaults.module";

@Module({
	imports: [ServicesModule, forwardRef(() => AuthModule), VaultsModule],
	controllers: [SyncHttpController],
	providers: [SyncService],
})
export class SyncModule {}
