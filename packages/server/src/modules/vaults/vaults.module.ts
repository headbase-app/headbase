import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "@modules/auth/auth.module.js";
import { ServicesModule } from "@services/services.module.js";
import { VaultsService } from "@modules/vaults/vaults.service.js";
import { VaultsHttpController } from "@modules/vaults/vaults.controller.js";
import { ChunksModule } from "@modules/chunks/chunks.module.js";

@Module({
	imports: [ServicesModule, forwardRef(() => AuthModule), forwardRef(() => ChunksModule)],
	controllers: [VaultsHttpController],
	providers: [VaultsService],
	exports: [VaultsService],
})
export class VaultsModule {}
