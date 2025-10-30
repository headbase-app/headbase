import { NestFactory } from "@nestjs/core";
import { NestApplicationOptions, VersioningType } from "@nestjs/common";
import helmet from "helmet";
import { NextFunction, Request, Response } from "express";
import { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module";
import { ErrorFilter } from "@services/errors/error.filter";
import { ConfigService } from "@services/config/config.service";
import { queryParser } from "@common/qs-query-parser";

export async function createApp(options?: NestApplicationOptions) {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, options || {});
	const configService = app.get(ConfigService);

	app.enableCors({
		origin: configService.vars.general.allowedOrigins,
	});

	app.set("query parser", queryParser);

	app.enableVersioning({
		type: VersioningType.URI,
	});

	app.use(helmet());

	// GNU Terry Pratchett (http://www.gnuterrypratchett.com/)
	app.use((req: Request, res: Response, next: NextFunction) => {
		res.set("x-clacks-overhead", "GNU Terry Pratchett");
		next();
	});

	app.useGlobalFilters(new ErrorFilter());

	return app;
}
