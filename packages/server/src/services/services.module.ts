import { Module } from "@nestjs/common";
import { ConfigService } from "./config/config.service";
import { CacheStoreService } from "@services/cache-store/cache-store.service";
import { DatabaseService } from "@services/database/database.service";
import { EmailService } from "@services/email/email.service";
import { EventsService } from "@services/events/events.service";
import { ObjectStoreService } from "@services/object-store/object-store.service";
import { PasswordService } from "@services/password/password.service";
import { TokenService } from "@services/token/token.service";

@Module({
	providers: [CacheStoreService, ConfigService, DatabaseService, EmailService, EventsService, ObjectStoreService, PasswordService, TokenService],
	exports: [CacheStoreService, ConfigService, DatabaseService, EmailService, EventsService, ObjectStoreService, PasswordService, TokenService],
})
export class ServicesModule {}
