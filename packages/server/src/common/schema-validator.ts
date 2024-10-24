import {z} from "zod";

import {UserRequestError} from "@services/errors/base/user-request.error.js";


export async function validateSchema<Schema extends z.Schema>(data: any, schema: Schema): Promise<z.infer<Schema>> {
    const result = await schema.safeParseAsync(data);

    if (result.success) {
      return result.data
    }
    else {
      // todo: format used to always work, but now the extra .flatten logic is sometimes required?
      const formattedError = result.error.format();

      let errorMessage: string;
      if (formattedError._errors.length > 0) {
        errorMessage = formattedError._errors.join(",")
      }
      else {
        const fieldErrors = result.error.flatten().fieldErrors
        errorMessage = Object.values(fieldErrors).join(",")
      }

      throw new UserRequestError({
        message: "Request data failed validation",
        applicationMessage: errorMessage
      })
  }
}
