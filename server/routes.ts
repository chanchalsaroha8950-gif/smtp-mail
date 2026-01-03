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
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  app.post(api.email.send.path, async (req, res) => {
    try {
      const input = api.email.send.input.parse(req.body);
      
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(500).json({ message: "SMTP configuration is missing in environment variables" });
      }

      try {
        const isHtml = input.body.trim().startsWith('<') && input.body.trim().endsWith('>');
        const info = await transporter.sendMail({
          from: `"lastanime Support" <${process.env.SMTP_EMAIL || 'support@lastanime.in'}>`, 
          to: input.to, 
          subject: input.subject, 
          text: input.body, 
          html: isHtml ? input.body : input.body.replace(/\n/g, '<br>'), 
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
