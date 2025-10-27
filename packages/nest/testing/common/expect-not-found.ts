import { expect } from "@jest/globals";
import { HttpStatus } from "@nestjs/common";
import { ErrorIdentifiers } from "@headbase-app/contracts";

export function expectNotFound(body: any, statusCode: any, identifier: any = ErrorIdentifiers.NOT_FOUND) {
	expect(statusCode).toEqual(HttpStatus.NOT_FOUND);
	expect(body).toEqual(
		expect.objectContaining({
			identifier: identifier,
		}),
	);
}
