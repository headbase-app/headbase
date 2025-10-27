import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "@modules/auth/auth.module";
import { ServicesModule } from "@services/services.module";
import { VaultsService } from "@modules/vaults/vaults.service";
import { VaultsHttpController } from "@modules/vaults/vaults.controller";

@Module({
	imports: [ServicesModule, forwardRef(() => AuthModule)],
	controllers: [VaultsHttpController],
	providers: [VaultsService],
	exports: [VaultsService],
})
export class VaultsModule {}
