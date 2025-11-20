import { forwardRef, Module } from "@nestjs/common";
import { UsersHttpController } from "@modules/users/users.controller.js";
import { UsersService } from "@modules/users/users.service.js";
import { AuthModule } from "@modules/auth/auth.module.js";
import { ServerManagementModule } from "@modules/server/server.module.js";
import { ServicesModule } from "@services/services.module.js";

@Module({
	imports: [ServicesModule, forwardRef(() => ServerManagementModule), forwardRef(() => AuthModule)],
	controllers: [UsersHttpController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
