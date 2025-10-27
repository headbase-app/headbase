import { Module } from "@nestjs/common";
import { ServicesModule } from "@services/services.module";
import { BaseModule } from "@modules/base/base.module";
import { ServerManagementModule } from "@modules/server/server.module";
import { AuthModule } from "@modules/auth/auth.module";
import { UsersModule } from "@modules/users/users.module";

@Module({
	imports: [ServicesModule, BaseModule, ServerManagementModule, AuthModule, UsersModule],
})
export class AppModule {}
