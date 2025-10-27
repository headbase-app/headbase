import { forwardRef, Module } from "@nestjs/common";
import { UsersHttpController } from "@modules/users/users.controller";
import { UsersService } from "@modules/users/users.service";
import { AuthModule } from "@modules/auth/auth.module";
import { ServerManagementModule } from "@modules/server/server.module";
import { ServicesModule } from "@services/services.module";

@Module({
	imports: [ServicesModule, forwardRef(() => ServerManagementModule), forwardRef(() => AuthModule)],
	controllers: [UsersHttpController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
