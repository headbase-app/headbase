import Mailgun, {MailgunClientOptions} from "mailgun.js";
import formData from "form-data";
import {IMailgunClient} from "mailgun.js/Interfaces";

import {EnvironmentService} from "@services/environment/environment.service.js";


export interface EmailData {
  to: string,
  subject: string,
  message: string
}


export class EmailService {
  private readonly mailgunClient: IMailgunClient;
  private readonly senderString: string;

  constructor(private envService: EnvironmentService) {
    const mailgun = new Mailgun.default(formData);
    const options: MailgunClientOptions = {
      username: "api",
      key: this.envService.vars.email.mailgun.apiKey,
    }
    if (this.envService.vars.email.mailgun.isEu) {
      options.url = "https://api.eu.mailgun.net";
    }
    this.mailgunClient = mailgun.client(options);

    this.senderString = `${this.envService.vars.email.mailgun.sender.name} <${this.envService.vars.email.mailgun.sender.address}@${this.envService.vars.email.mailgun.domain}>`;
  }

  async sendEmail(data: EmailData) {
    if (this.envService.vars.email.sendMode === "silent") {
      return
    }

    if (this.envService.vars.email.sendMode === "log") {
      console.log(`[EMAIL]: ${data.to}`);
      console.table(data);
      return;
    }

    return this.mailgunClient.messages.create(
      this.envService.vars.email.mailgun.domain,
      {
        from: this.senderString,
        to: [data.to],
        subject: data.subject,
        text: data.message
      }
    )
  }
}
