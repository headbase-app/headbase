import {Request, Response} from "express";
import {HttpStatusCodes} from "@common/http-status-codes.js";

export class BaseHttpController {
  async sendWelcomeMessage(req: Request, res: Response) {
    res.status(HttpStatusCodes.OK).send({
      message: "Welcome to the Headbase server. For docs see https://github.com/headbase-app/headbase."
    })
  }
}
