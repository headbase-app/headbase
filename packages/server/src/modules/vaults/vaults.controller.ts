import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";

import { UpdateVaultDto, VaultsURLParams, VaultsQueryParams, VaultDto } from "@headbase-app/contracts";
import { VaultsService } from "@modules/vaults/vaults.service";
import { AuthenticationGuard } from "@modules/auth/auth.guard";
import { ZodValidationPipe } from "@common/zod-validator.pipe";
import { RequestContext } from "@common/request-context";

@Controller({
	path: "/vaults",
	version: "1",
})
@UseGuards(AuthenticationGuard)
export class VaultsHttpController {
	constructor(private vaultsService: VaultsService) {}

	@Post()
	async createVault(@RequestContext() requestContext: RequestContext, @Body(new ZodValidationPipe(VaultDto)) vaultDto: VaultDto) {
		return this.vaultsService.create(requestContext.user, vaultDto);
	}

	@Get(":vaultId")
	async getVault(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(VaultsURLParams)) params: VaultsURLParams) {
		return this.vaultsService.get(requestContext.user, params.vaultId);
	}

	@Get()
	async queryVaults(@RequestContext() requestContext: RequestContext, @Query(new ZodValidationPipe(VaultsQueryParams)) query: VaultsQueryParams) {
		return this.vaultsService.query(requestContext.user, query);
	}

	@Patch(":vaultId")
	async updateVault(
		@RequestContext() requestContext: RequestContext,
		@Param(new ZodValidationPipe(VaultsURLParams)) params: VaultsURLParams,
		@Body(new ZodValidationPipe(UpdateVaultDto)) updateVaultDto: UpdateVaultDto,
	) {
		return this.vaultsService.update(requestContext.user, params.vaultId, updateVaultDto);
	}

	@Delete(":vaultId")
	async deleteVault(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(VaultsURLParams)) params: VaultsURLParams) {
		return this.vaultsService.delete(requestContext.user, params.vaultId);
	}

	@Get(":vaultId/chunks")
	async getChunks(@RequestContext() requestContext: RequestContext, @Param(new ZodValidationPipe(VaultsURLParams)) params: VaultsURLParams) {
		return this.vaultsService.getChunks(requestContext.user, params.vaultId);
	}
}
