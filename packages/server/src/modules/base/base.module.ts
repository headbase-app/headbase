import { Module } from "@nestjs/common";
import { BaseHttpController } from "./base.controller.js";

@Module({
	controllers: [BaseHttpController],
	providers: [],
})
export class BaseModule {}
