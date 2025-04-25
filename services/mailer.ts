import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log("GMAIL USER:", process.env.MAIL_USER);
console.log("APP PASSWORD:", process.env.APP_PASSWORD ? "✅ Loaded" : "❌ MISSING");

const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string, text?: string): Promise<void> => {
  const mailOptions: SendMailOptions = {
    from: {
      name: 'OOCAA',
      address: process.env.MAIL_USER as string,
    },
    to,
    subject,
    text: text || '', // fallback if you want a plain text version
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(` Email sent to ${to}`);
  } catch (error) {
    console.error(' Error sending email:', error);
  }
};
