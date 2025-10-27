import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { BaseError } from "./base/base.error";
import { fallbackMapping, errorHttpMapping } from "./error-http-mappings";
import { ErrorIdentifiers } from "@headbase-app/contracts";

@Catch(BaseError, HttpException)
export class ErrorFilter implements ExceptionFilter {
	catch(error: BaseError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		return this.sendErrorResponse(error, response);
	}

	sendErrorResponse(err: Error, res: Response) {
		const errorName = err.constructor.name;

		// Intercept NestJS errors to customise responses, otherwise fallback to NestJS formatted response.
		if (err instanceof HttpException) {
			if (errorName === "NotFoundException") {
				return res.status(HttpStatus.NOT_FOUND).send({
					identifier: ErrorIdentifiers.NOT_FOUND,
					statusCode: HttpStatus.NOT_FOUND,
					message: "The route you requested could not be found.",
				});
			} else if (errorName === "BadRequestException") {
				return res.status(HttpStatus.BAD_REQUEST).send({
					identifier: ErrorIdentifiers.REQUEST_INVALID,
					statusCode: HttpStatus.BAD_REQUEST,
					message: "Your request was invalid.",
				});
			} else {
				return res.status(err.getStatus()).send({
					statusCode: err.getStatus(),
					message: err.getResponse(),
				});
			}
		}

		// Process custom errors
		const httpCode = errorHttpMapping[errorName]?.statusCode || fallbackMapping.statusCode;
		let message = fallbackMapping.defaultMessage;
		let identifier = fallbackMapping.identifier;

		if (err instanceof BaseError) {
			if (err.userMessage) {
				message = err.userMessage;
			} else if (errorHttpMapping[errorName]?.defaultMessage) {
				message = errorHttpMapping[errorName].defaultMessage;
			}

			if (err.identifier) {
				identifier = err.identifier;
			} else if (errorHttpMapping[errorName]?.identifier) {
				identifier = errorHttpMapping[errorName].identifier;
			}
		}

		return res.status(httpCode).send({
			identifier: identifier,
			statusCode: httpCode,
			message: message,
		});
	}
}
