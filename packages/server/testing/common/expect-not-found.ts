import { expect } from "vitest"

import {ErrorIdentifiers} from "@headbase-app/common";

import {HttpStatusCodes} from "@common/http-status-codes.js";

export function expectNotFound(body: any, statusCode: any, identifier: any = ErrorIdentifiers.NOT_FOUND) {
  expect(statusCode).toEqual(HttpStatusCodes.NOT_FOUND);
  expect(body).toEqual(expect.objectContaining({
    identifier: identifier
  }))
}
