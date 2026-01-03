import { db } from "./db";
import {
  emailLogs,
  type InsertEmailLog,
  type EmailLog
} from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  logEmail(log: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(): Promise<EmailLog[]>;
}

export class DatabaseStorage implements IStorage {
  async logEmail(log: InsertEmailLog): Promise<EmailLog> {
    const [entry] = await db.insert(emailLogs).values(log).returning();
    return entry;
  }

  async getEmailLogs(): Promise<EmailLog[]> {
    return await db.select().from(emailLogs).orderBy(desc(emailLogs.sentAt));
  }
}

export const storage = new DatabaseStorage();
