import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import nodemailer from "nodemailer";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // SMTP Configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "9e50d1001@smtp-brevo.com",
      pass: process.env.SMTP_PASS || "xsmtpsib-8dfd64a23a36e83233e0ea6f7279d1744a3e7287ca2276e66b53b8074d7c3711-qkGsEuKpLTgmAPYI",
    },
  });

  app.post(api.email.send.path, async (req, res) => {
    try {
      const input = api.email.send.input.parse(req.body);
      
      try {
        const info = await transporter.sendMail({
          from: `"Support" <${process.env.SMTP_EMAIL || 'support@lastanime.in'}>`, // sender address
          to: input.to, // list of receivers
          subject: input.subject, // Subject line
          text: input.body, // plain text body
          html: `<p>${input.body.replace(/\n/g, '<br>')}</p>`, // html body
        });

        console.log("Message sent: %s", info.messageId);

        await storage.logEmail({
          to: input.to,
          subject: input.subject,
          body: input.body,
          status: 'sent',
          error: null
        });

        res.status(200).json({ message: "Email sent successfully", success: true });

      } catch (emailError: any) {
        console.error("Error sending email:", emailError);
        
        await storage.logEmail({
          to: input.to,
          subject: input.subject,
          body: input.body,
          status: 'failed',
          error: emailError.message || "Unknown error"
        });

        res.status(500).json({ message: "Failed to send email: " + emailError.message });
      }

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.email.history.path, async (req, res) => {
    const history = await storage.getEmailLogs();
    res.json(history);
  });

  return httpServer;
}
