import { Module } from "@nestjs/common";
import { FilesHttpController } from "./files.controller.js";
import { FilesService } from "@modules/files/files.service.js";
import { ServicesModule } from "@services/services.module.js";
import { AuthModule } from "@modules/auth/auth.module.js";
import { VaultsModule } from "@modules/vaults/vaults.module.js";
import { ChunksModule } from "@modules/chunks/chunks.module.js";

@Module({
	imports: [ServicesModule, AuthModule, VaultsModule, ChunksModule],
	controllers: [FilesHttpController],
	providers: [FilesService],
})
export class FilesModule {}
