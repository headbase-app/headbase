import { forwardRef, Module } from "@nestjs/common";
import { ChunksHttpController } from "@modules/chunks/chunks.controller";
import { ChunksService } from "@modules/chunks/chunks.service";
import { VaultsModule } from "@modules/vaults/vaults.module";
import { ServicesModule } from "@services/services.module";
import { AuthModule } from "@modules/auth/auth.module";

@Module({
	imports: [ServicesModule, forwardRef(() => VaultsModule), AuthModule],
	controllers: [ChunksHttpController],
	providers: [ChunksService],
	exports: [ChunksService],
})
export class ChunksModule {}
