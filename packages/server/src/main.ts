import { Logger } from "@nestjs/common";
import { createApp } from "./create-app.js";

import { ConfigService } from "@services/config/config.service.js";

async function bootstrap() {
	const app = await createApp();

	const configService = app.get(ConfigService);
	await app.listen(configService.vars.general.port);

	const serverLogger = new Logger("Server");
	serverLogger.log(`Server started and listening at: http://localhost:${configService.vars.general.port}`);
}
bootstrap();
