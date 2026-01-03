import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path === "/" || path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.get("/", (_req, res) => {
    res.send(`
      <div style="font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6;">
        <h1 style="color: #2563eb;">lastanime Support Email Backend</h1>
        <p>Your backend is running successfully and ready for API calls.</p>
        
        <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">API Endpoints</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">1. Send Email (POST)</h3>
          <p><strong>URL:</strong> <code>/api/email/send</code></p>
          <p><strong>Payload (JSON):</strong></p>
          <pre style="background: #1e293b; color: #f8fafc; padding: 15px; border-radius: 6px; overflow-x: auto;">
{
  "to": "recipient@example.com",
  "subject": "Hello from lastanime",
  "body": "This is the email content. Supports HTML tags."
}
          </pre>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0;">2. Email History (GET)</h3>
          <p><strong>URL:</strong> <code>/api/email/history</code></p>
          <p>Returns a list of all recent email delivery attempts.</p>
        </div>
      </div>
    `);
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
