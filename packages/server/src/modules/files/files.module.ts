import { Module } from "@nestjs/common";
import { FilesHttpController } from "./files.controller";
import { FilesService } from "@modules/files/files.service";
import { ServicesModule } from "@services/services.module";
import { AuthModule } from "@modules/auth/auth.module";
import { VaultsModule } from "@modules/vaults/vaults.module";
import { ChunksModule } from "@modules/chunks/chunks.module";

@Module({
	imports: [ServicesModule, AuthModule, VaultsModule, ChunksModule],
	controllers: [FilesHttpController],
	providers: [FilesService],
})
export class FilesModule {}
