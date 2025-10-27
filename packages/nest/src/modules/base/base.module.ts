import { Module } from "@nestjs/common";
import { BaseHttpController } from "./base.controller";

@Module({
	controllers: [BaseHttpController],
	providers: [],
})
export class BaseModule {}
