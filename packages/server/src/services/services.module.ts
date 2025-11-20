import { Module } from "@nestjs/common";

import { ConfigService } from "./config/config.service.js";
import { DatabaseService } from "@services/database/database.service.js";
import { EmailService } from "@services/email/email.service.js";
import { EventsService } from "@services/events/events.service.js";
import { ObjectStoreService } from "@services/object-store/object-store.service.js";
import { PasswordService } from "@services/password/password.service.js";
import { TokenService } from "@services/token/token.service.js";

@Module({
	providers: [ConfigService, DatabaseService, EmailService, EventsService, ObjectStoreService, PasswordService, TokenService],
	exports: [ConfigService, DatabaseService, EmailService, EventsService, ObjectStoreService, PasswordService, TokenService],
})
export class ServicesModule {}
