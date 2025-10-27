import { NestFactory } from "@nestjs/core";
import { NestApplicationOptions, VersioningType } from "@nestjs/common";

import { AppModule } from "./app.module";
import { ErrorFilter } from "@services/errors/error.filter";
import { ConfigService } from "@services/config/config.service";

export async function createApp(options?: NestApplicationOptions) {
	const app = await NestFactory.create(AppModule, options || {});
	const configService = app.get(ConfigService);

	app.enableCors({
		origin: configService.vars.general.allowedOrigins,
	});

	app.enableVersioning({
		type: VersioningType.URI,
	});

	app.useGlobalFilters(new ErrorFilter());

	return app;
}
