import { ConfigService } from "./services/config/config.service.js";
import { LoggerService } from "./services/logger/logger.service.js";
import { createServer } from "./create-server.js";

const configService = new ConfigService();
const loggerService = new LoggerService();

const server = createServer(configService, loggerService);
server.listen(configService.config().server.port);
loggerService.info("server", `server started at http://localhost:${configService.config().server.port}`)
