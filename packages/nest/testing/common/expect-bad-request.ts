import { expect } from "@jest/globals";
import { HttpStatus } from "@nestjs/common";
import { ErrorIdentifiers } from "@headbase-app/contracts";

export function expectBadRequest(body: any, statusCode: any, identifier: any = ErrorIdentifiers.REQUEST_INVALID) {
	expect(statusCode).toEqual(HttpStatus.BAD_REQUEST);
	expect(body).toEqual(
		expect.objectContaining({
			identifier: identifier,
		}),
	);
}
