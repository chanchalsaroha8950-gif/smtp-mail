import {
  emailLogs,
  type InsertEmailLog,
  type EmailLog
} from "@shared/schema";

export interface IStorage {
  logEmail(log: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(): Promise<EmailLog[]>;
}

export class MemStorage implements IStorage {
  private logs: Map<number, EmailLog>;
  private currentId: number;

  constructor() {
    this.logs = new Map();
    this.currentId = 1;
  }

  async logEmail(log: InsertEmailLog): Promise<EmailLog> {
    const id = this.currentId++;
    const entry: EmailLog = { ...log, id };
    this.logs.set(id, entry);
    return entry;
  }

  async getEmailLogs(): Promise<EmailLog[]> {
    return Array.from(this.logs.values()).sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }
}

export const storage = new MemStorage();
