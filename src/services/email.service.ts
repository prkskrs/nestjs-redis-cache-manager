import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    dotenv.config();
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(options: { email: string; subject: string; html?: string; message: string }): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'Catalysts <no-reply@catalyst.reachout>',
      to: options.email,
      subject: options.subject,
    };

    if (options.html) {
      mailOptions.html = options.message;
    } else {
      mailOptions.text = options.message;
    }

    await this.transporter.sendMail(mailOptions);
  }
}
