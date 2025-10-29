import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "@modules/auth/auth.module";
import { ServicesModule } from "@services/services.module";
import { VaultsService } from "@modules/vaults/vaults.service";
import { VaultsHttpController } from "@modules/vaults/vaults.controller";
import { ChunksModule } from "@modules/chunks/chunks.module";

@Module({
	imports: [ServicesModule, forwardRef(() => AuthModule), forwardRef(() => ChunksModule)],
	controllers: [VaultsHttpController],
	providers: [VaultsService],
	exports: [VaultsService],
})
export class VaultsModule {}
