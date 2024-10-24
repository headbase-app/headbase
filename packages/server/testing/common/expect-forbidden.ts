import { expect } from "vitest"

import {ErrorIdentifiers} from "@headbase-app/common";

import {HttpStatusCodes} from "@common/http-status-codes.js";


export function expectForbidden(body: any, statusCode: any, identifier: string = ErrorIdentifiers.ACCESS_FORBIDDEN) {
  expect(statusCode).toEqual(HttpStatusCodes.FORBIDDEN);
  expect(body).toHaveProperty("identifier");
  expect(body.identifier).toEqual(identifier);
}
