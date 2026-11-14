import { createServer as createHttpServer } from 'http';
import express from "express";

import {ConfigService} from "./services/config/config.service.js";
import {LoggerService} from './services/logger/logger.service.js';
import {RelayController} from "./modules/relay/relay.controller.js";
import {RelayService} from "./modules/relay/relay.service.js";

export function createServer(
	configService: ConfigService,
	loggerService: LoggerService,
) {
	const app = express();
	const server = createHttpServer(app);

	// todo: endpoint isn't formally included in spec document.
	app.get('/', (req, res) => {
		res.send({
			version: configService.config().relay.serverVersion,
			isPublic: configService.config().relay.accessSecret === null,
		})
	})

	const relayService = new RelayService(configService, loggerService);
	new RelayController(server, configService, loggerService, relayService)
	return server
}
