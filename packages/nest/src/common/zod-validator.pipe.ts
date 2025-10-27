import { Schema } from "zod";
import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

import { UserRequestError } from "@services/errors/base/user-request.error";

// todo: use as global pipe?
@Injectable()
export class ZodValidationPipe implements PipeTransform {
	constructor(private schema: Schema) {}

	transform(data: any, metadata: ArgumentMetadata) {
		const result = this.schema.safeParse(data);

		if (result.success) {
			return data;
		} else {
			// todo: format used to always work, but now the extra .flatten logic is sometimes required?
			const formattedError = result.error.format();

			let errorMessage: string;
			if (formattedError._errors.length > 0) {
				errorMessage = formattedError._errors.join(",");
			} else {
				const fieldErrors = result.error.flatten().fieldErrors;
				errorMessage = Object.values(fieldErrors).join(",");
			}

			throw new UserRequestError({
				message: "Request data failed validation",
				userMessage: errorMessage,
			});
		}
	}
}
