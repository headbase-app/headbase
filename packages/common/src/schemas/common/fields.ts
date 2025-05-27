import {z} from "zod";

// todo: can message be changed without needing this function?
export function createIdField(key: string = "id") {
	return z.string().uuid(`${key} field must be a uuid`)
}

export function createDateField(key: string = "date") {
	return z.string().datetime({message: `${key} must be UTC timestamp`})
}
