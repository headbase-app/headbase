import { Controller, Delete, Get, Post, UseGuards, Version } from "@nestjs/common";
import { AuthenticationGuard } from "@modules/auth/auth.guard";

@Controller({
	path: "/files",
	version: "1",
})
@UseGuards(AuthenticationGuard)
export class FilesHttpController {
	@Post()
	create() {
		return {};
	}

	@Get()
	query() {
		return [];
	}

	@Get(":fileId")
	get() {
		return {};
	}

	@Delete(":fileId")
	delete() {
		return {};
	}

	@Post(":fileId/commit")
	commit() {}

	@Get(":fileId/chunks")
	getChunks() {
		return [];
	}
}
