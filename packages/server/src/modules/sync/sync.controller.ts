import { Controller, Get, UseGuards } from "@nestjs/common";

import { SyncService } from "@modules/sync/sync.service.js";
import { AuthenticationGuard } from "@modules/auth/auth.guard.js";
import { RequestContext } from "@common/request-context.js";

@Controller({
	path: "/sync",
	version: "1",
})
export class SyncHttpController {
	constructor(private readonly syncService: SyncService) {}

	@Get("/ticket")
	@UseGuards(AuthenticationGuard)
	async getConnectionTicket(@RequestContext() requestContext: RequestContext) {
		return this.syncService.requestTicket(requestContext.user);
	}
}
