import { forwardRef, Module } from "@nestjs/common";
import { AuthHttpController } from "@modules/auth/auth.controller";
import { AuthService } from "@modules/auth/auth.service";
import { AccessControlService } from "@modules/auth/access-control.service";
import { UsersModule } from "@modules/users/users.module";
import { ServicesModule } from "@services/services.module";

@Module({
	imports: [ServicesModule, forwardRef(() => UsersModule)],
	controllers: [AuthHttpController],
	providers: [AuthService, AccessControlService],
	exports: [AccessControlService],
})
export class AuthModule {}
