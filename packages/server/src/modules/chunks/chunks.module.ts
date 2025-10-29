import { Module } from "@nestjs/common";
import { ChunksHttpController } from "@modules/chunks/chunks.controller";
import { ChunksService } from "@modules/chunks/chunks.service";
import { VaultsModule } from "@modules/vaults/vaults.module";
import { ServicesModule } from "@services/services.module";

@Module({
	imports: [ServicesModule, VaultsModule],
	controllers: [ChunksHttpController],
	providers: [ChunksService],
})
export class ChunksModule {}
