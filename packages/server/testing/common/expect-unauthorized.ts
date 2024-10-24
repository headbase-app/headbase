import { expect } from "vitest"

import {ErrorIdentifiers} from "@headbase-app/common";

import {HttpStatusCodes} from "@common/http-status-codes.js";


export function expectUnauthorized(body: any, statusCode: any, identifier: string = ErrorIdentifiers.ACCESS_UNAUTHORIZED) {
  expect(statusCode).toEqual(HttpStatusCodes.UNAUTHORIZED);
  expect(body).toHaveProperty("identifier");
  expect(body.identifier).toEqual(identifier);
}