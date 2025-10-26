import { expect } from "vitest"

import {ErrorIdentifiers} from "@headbase-app/contracts";

import {HttpStatusCodes} from "@common/http-status-codes.js";


export function expectBadRequest(body: any, statusCode: any, identifier: any = ErrorIdentifiers.REQUEST_INVALID) {
  expect(statusCode).toEqual(HttpStatusCodes.BAD_REQUEST);
  expect(body).toEqual(expect.objectContaining({
    identifier: identifier
  }))
}
