import { Controller, Get, Version } from "@nestjs/common";

@Controller()
export class BaseHttpController {
	@Get()
	sendWelcomeMessage() {
		return {
			message: "Welcome to the Headbase server. For docs see https://github.com/headbase-app/headbase.",
		};
	}

	@Get()
	@Version("1")
	sendWelcomeMessageV1() {
		return this.sendWelcomeMessage();
	}
}
