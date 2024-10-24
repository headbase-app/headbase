import {NextFunction, Request, Response} from "express";
import {HttpStatusCodes} from "@common/http-status-codes.js";

export class BaseHttpController {
  async sendWelcomeMessage(req: Request, res: Response, next: NextFunction) {
    return res.status(HttpStatusCodes.OK).send({
      message: "Welcome to the Headbase server. For docs see https://github.com/headbase-app/headbase."
    })
  }
}
