import {NextFunction, Request, Response} from "express";

import {BaseError} from "@services/errors/base/base.error.js";
import {errorHttpMapping, fallbackMapping} from "./error-http-mappings.js";
import {HttpStatusCodes} from "@common/http-status-codes.js";

/**
 * Detect if the given error has come from body-parser.
 * Thanks to https://github.com/ntedgi/express-body-parser-error-handler for this function.
 */
function isBodyParserError(error: any): boolean {
  const bodyParserCommonErrorsTypes = [
    "encoding.unsupported",
    "entity.parse.failed",
    "entity.verify.failed",
    "request.aborted",
    "request.size.invalid",
    "stream.encoding.set",
    "parameters.too.many",
    "charset.unsupported",
    "entity.too.large",
  ];

  return bodyParserCommonErrorsTypes.includes(error.type);
}


export async function httpErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const errorName = err.constructor.name;

  let httpCode = errorHttpMapping[errorName]?.statusCode || fallbackMapping.statusCode;
  let message = fallbackMapping.defaultMessage;
  let identifier = fallbackMapping.identifier;

  if (err instanceof BaseError) {
    if (err.applicationMessage) {
      message = err.applicationMessage;
    }
    else if (errorHttpMapping[errorName]?.defaultMessage) {
      message = errorHttpMapping[errorName].defaultMessage;
    }

    if (err.identifier) {
      identifier = err.identifier;
    }
    else if (errorHttpMapping[errorName]?.identifier) {
      identifier = errorHttpMapping[errorName].identifier;
    }
  }
  // Ensure errors from body-parser package are handled as user request errors and not generic internal server errors.
  else if (isBodyParserError(err)) {
    httpCode = errorHttpMapping["UserRequestError"].statusCode
    identifier = errorHttpMapping["UserRequestError"].identifier
    if (errorHttpMapping[errorName]?.defaultMessage) {
      message = errorHttpMapping[errorName].defaultMessage;
    }
  }

  // todo: add more advanced logging/alerting on server errors?
  if (httpCode === HttpStatusCodes.INTERNAL_SERVER_ERROR) {
    console.error(err)
  }

  return res.status(httpCode).send({
    identifier: identifier,
    statusCode: httpCode,
    message: message,
  });
}
