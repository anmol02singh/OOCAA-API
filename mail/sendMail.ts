import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log("GMAIL USER:", process.env.MAIL_USER);
console.log("GMAIL APP PASSWORD:", process.env.APP_PASSWORD ? "✅ Loaded" : "❌ MISSING");

const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for port 465, false for others
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

const mailOptions: SendMailOptions = {
  from: {
    name: 'OOCA',
    address: process.env.MAIL_USER as string,
  },
  to: 'saniac249@gmail.com',
  subject: 'WELCOME TO OOCA',
  text: 'Hello world?',
  html: '<b>Hello world?</b>',
};

const sendMail = async (transporter: Transporter, mailOptions: SendMailOptions): Promise<void> => {
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email has been sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

sendMail(transporter, mailOptions);
