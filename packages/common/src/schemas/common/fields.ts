import {z} from "zod";

// todo: can message be changed without needing this function?
export function createIdField(key: string = "id") {
	return z.string().uuid(`${key} field must be a uuid`)
}

// todo: there should probably be a size limit on these fields?
// should that be set here, on controlled entirely by the server?
export const ProtectedDataField = z.string()
	.min(1, 'protectedData field must not be empty')

export function createDateField(key: string = "date") {
	return z.string().datetime({message: `${key} must be UTC timestamp`})
}
