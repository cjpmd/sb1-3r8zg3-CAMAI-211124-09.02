import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebhookLogger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logFile = path.join(this.logDir, 'webhook-events.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  logWebhookEvent(event: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      eventType: event.type,
      eventId: event.id,
      data: event.data?.object,
    };

    const logMessage = `${JSON.stringify(logEntry, null, 2)}\n---\n`;
    
    try {
      fs.appendFileSync(this.logFile, logMessage);
      
      // Also log to console for development
      console.log('Webhook Event Received:', {
        timestamp,
        eventType: event.type,
        eventId: event.id,
      });
    } catch (error) {
      console.error('Error writing to webhook log:', error);
    }
  }

  logError(error: any, context: string) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: 'ERROR',
      context,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };

    const logMessage = `${JSON.stringify(logEntry, null, 2)}\n---\n`;
    
    try {
      fs.appendFileSync(this.logFile, logMessage);
      
      // Also log to console
      console.error('Webhook Error:', {
        timestamp,
        context,
        error: error instanceof Error ? error.message : String(error),
      });
    } catch (writeError) {
      console.error('Error writing to webhook log:', writeError);
    }
  }
}

export const webhookLogger = new WebhookLogger();
