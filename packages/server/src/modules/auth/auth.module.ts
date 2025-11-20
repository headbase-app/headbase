import { forwardRef, Module } from "@nestjs/common";

import { AuthHttpController } from "@modules/auth/auth.controller.js";
import { AuthService } from "@modules/auth/auth.service.js";
import { UsersModule } from "@modules/users/users.module.js";
import { ServicesModule } from "@services/services.module.js";

@Module({
	imports: [ServicesModule, forwardRef(() => UsersModule)],
	controllers: [AuthHttpController],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
