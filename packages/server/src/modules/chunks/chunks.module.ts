import { forwardRef, Module } from "@nestjs/common";
import { ChunksHttpController } from "@modules/chunks/chunks.controller.js";
import { ChunksService } from "@modules/chunks/chunks.service.js";
import { VaultsModule } from "@modules/vaults/vaults.module.js";
import { ServicesModule } from "@services/services.module.js";
import { AuthModule } from "@modules/auth/auth.module.js";

@Module({
	imports: [ServicesModule, forwardRef(() => VaultsModule), AuthModule],
	controllers: [ChunksHttpController],
	providers: [ChunksService],
	exports: [ChunksService],
})
export class ChunksModule {}
