import nodemailer, { Transporter } from "nodemailer";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@services/config/config.service";

export interface EmailData {
	to: string;
	subject: string;
	message: string;
	htmlMessage?: string;
}

@Injectable()
export class EmailService {
	transporter: Transporter;

	constructor(private configService: ConfigService) {
		const SMTP_HOST = this.configService.vars.email.smtp.host;
		const SMTP_PORT = this.configService.vars.email.smtp.port;
		const SMTP_USERNAME = this.configService.vars.email.smtp.username;
		const SMTP_PASSWORD = this.configService.vars.email.smtp.password;

		this.transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			secure: false,
			auth: {
				user: SMTP_USERNAME,
				pass: SMTP_PASSWORD,
			},
		});
	}

	async sendEmail(data: EmailData) {
		if (this.configService.vars.email.sendMode === "silent") {
			return;
		}

		// todo: replace with logger service?
		if (this.configService.vars.email.sendMode === "log") {
			console.log(`[email]: ${data.to}`);
			console.table(data);
			return;
		}

		const SENDER_NAME = this.configService.vars.email.sender.name;
		const SENDER_ADDRESS = this.configService.vars.email.sender.address;

		await this.transporter.sendMail({
			from: `"${SENDER_NAME}" <${SENDER_ADDRESS}>`,
			to: data.to,
			subject: data.subject,
			text: data.message,
			html: data.htmlMessage,
		});
	}
}
