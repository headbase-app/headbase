import { ErrorIdentifiers } from "@headbase-app/contracts";
import { HttpStatus } from "@nestjs/common";

export interface ErrorHttpMapping {
	identifier: string;
	statusCode: HttpStatus;
	defaultMessage: string;
}

export interface ErrorHttpMappings {
	[x: string]: ErrorHttpMapping;
}

// todo: distinguish 50x errors?
// https://web.archive.org/web/20180226110035/http://www.codetinkerer.com/2015/12/04/choosing-an-http-status-code.html

export const fallbackMapping: ErrorHttpMapping = {
	identifier: ErrorIdentifiers.SYSTEM_UNEXPECTED,
	statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
	defaultMessage: "An unexpected error occurred while processing your request. Please try again later.",
};

export const errorHttpMapping: ErrorHttpMappings = {
	UserRequestError: {
		identifier: ErrorIdentifiers.REQUEST_INVALID,
		statusCode: HttpStatus.BAD_REQUEST,
		defaultMessage: "Your request was invalid.",
	},
	ResourceNotFoundError: {
		identifier: ErrorIdentifiers.RESOURCE_NOT_FOUND,
		statusCode: HttpStatus.NOT_FOUND,
		defaultMessage: "The requested resource could not be found.",
	},
	ResourceNotUniqueError: {
		identifier: ErrorIdentifiers.RESOURCE_NOT_UNIQUE,
		statusCode: HttpStatus.BAD_REQUEST,
		defaultMessage: "Your request would make a resource that is not unique.",
	},
	ResourceRelationshipError: {
		identifier: ErrorIdentifiers.RESOURCE_RELATIONSHIP_INVALID,
		statusCode: HttpStatus.BAD_REQUEST,
		defaultMessage: "Your request includes an invalid relationship to another resource.",
	},
	AccessUnauthorizedError: {
		identifier: ErrorIdentifiers.ACCESS_UNAUTHORIZED,
		statusCode: HttpStatus.UNAUTHORIZED,
		defaultMessage: "Your are not authorized to access the given resource.",
	},
	AccessForbiddenError: {
		identifier: ErrorIdentifiers.ACCESS_FORBIDDEN,
		statusCode: HttpStatus.FORBIDDEN,
		defaultMessage: "Your are forbidden from accessing the given resource.",
	},
	AccessCorsError: {
		identifier: ErrorIdentifiers.REQUEST_INVALID, // todo: should have unique cors error identifiers?
		statusCode: HttpStatus.BAD_REQUEST,
		defaultMessage: "Your request has failed CORS checks",
	},
};
