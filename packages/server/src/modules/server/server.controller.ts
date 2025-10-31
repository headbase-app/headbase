import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";

import { ServerManagementService, UpdateServerSettingsDto } from "@modules/server/server.service";
import { RequestContext } from "@common/request-context";
import { ZodValidationPipe } from "@common/zod-validator.pipe";
import { AuthenticationGuard } from "@modules/auth/auth.guard";

@Controller({
	path: "/server",
	version: "1",
})
export class ServerManagementHttpController {
	constructor(private readonly serverManagementService: ServerManagementService) {}

	@Get("/health")
	async requestHealthCheck() {
		return this.serverManagementService.runHealthCheck();
	}

	@Get("/info")
	async getInfo() {
		return this.serverManagementService.getInfo();
	}

	@Get("/settings")
	@UseGuards(AuthenticationGuard)
	async getSettings(@RequestContext() requestContext: RequestContext) {
		return this.serverManagementService.getSettings(requestContext.user);
	}

	@Patch("/settings")
	@UseGuards(AuthenticationGuard)
	async updateSettings(@RequestContext() requestContext: RequestContext, @Body(new ZodValidationPipe(UpdateServerSettingsDto)) updateDto: UpdateServerSettingsDto) {
		return this.serverManagementService.updateSettings(requestContext.user, updateDto);
	}
}
