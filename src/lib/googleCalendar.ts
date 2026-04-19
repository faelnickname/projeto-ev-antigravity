import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

class GoogleCalendarService {
    private calendar: any = null;
    private auth: any = null;
    private isSandbox: boolean = false;
    private SANDBOX_PATH: string;

    constructor() {
        this.SANDBOX_PATH = path.join(process.cwd(), 'src/data/sandbox-calendar.json');
        this.init();
    }

    private init() {
        // No Next.js, procuramos o arquivo na raiz do projeto ou via variável de ambiente
        const CREDENTIALS_PATH = path.join(process.cwd(), 'service-account.json');
        
        if (fs.existsSync(CREDENTIALS_PATH)) {
            try {
                this.auth = new google.auth.GoogleAuth({
                    keyFile: CREDENTIALS_PATH,
                    scopes: ['https://www.googleapis.com/auth/calendar'],
                });
                this.calendar = google.calendar({ version: 'v3', auth: this.auth });
                console.log('[Calendar] Google API Initialized ✓');
            } catch (e: any) {
                console.error('[Calendar] Auth Error:', e.message);
            }
        } else {
            console.warn('[Calendar] service-account.json not found. Using Sandbox Mode.');
            this.isSandbox = true;
            this.ensureSandboxFile();
        }
    }

    private ensureSandboxFile() {
        const dir = path.dirname(this.SANDBOX_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(this.SANDBOX_PATH)) {
            fs.writeFileSync(this.SANDBOX_PATH, JSON.stringify([], null, 2));
        }
    }

    async listEvents(timeMin: string = new Date().toISOString(), timeMax?: string) {
        if (this.isSandbox) {
            const data = JSON.parse(fs.readFileSync(this.SANDBOX_PATH, 'utf8'));
            return data.filter((e: any) => {
                const start = new Date(e.start.dateTime || e.start.date);
                if (timeMin && start < new Date(timeMin)) return false;
                if (timeMax && start > new Date(timeMax)) return false;
                return true;
            });
        }
        if (!this.calendar) throw new Error('Calendar service not configured.');
        
        const res = await this.calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin,
            timeMax: timeMax,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return res.data.items;
    }

    async createEvent(summary: string, start: string, end: string, description: string = '') {
        if (this.isSandbox) {
            const data = JSON.parse(fs.readFileSync(this.SANDBOX_PATH, 'utf8'));
            const newEvent = {
                id: 'sand_' + Math.random().toString(36).substr(2, 9),
                summary,
                description,
                start: { dateTime: new Date(start).toISOString() },
                end: { dateTime: new Date(end).toISOString() }
            };
            data.push(newEvent);
            fs.writeFileSync(this.SANDBOX_PATH, JSON.stringify(data, null, 2));
            return newEvent;
        }
        
        const event = {
            summary,
            description,
            start: { dateTime: new Date(start).toISOString() },
            end: { dateTime: new Date(end).toISOString() },
        };

        const res = await this.calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });
        return res.data;
    }

    async updateEvent(eventId: string, updates: any) {
        if (this.isSandbox) {
            const data = JSON.parse(fs.readFileSync(this.SANDBOX_PATH, 'utf8'));
            const idx = data.findIndex((e: any) => e.id === eventId);
            if (idx === -1) throw new Error('Event not found in Sandbox.');
            data[idx] = { ...data[idx], ...updates };
            fs.writeFileSync(this.SANDBOX_PATH, JSON.stringify(data, null, 2));
            return data[idx];
        }

        const res = await this.calendar.events.patch({
            calendarId: 'primary',
            eventId: eventId,
            resource: updates
        });
        return res.data;
    }

    async deleteEvent(eventId: string) {
        if (this.isSandbox) {
            const data = JSON.parse(fs.readFileSync(this.SANDBOX_PATH, 'utf8'));
            const newData = data.filter((e: any) => e.id !== eventId);
            fs.writeFileSync(this.SANDBOX_PATH, JSON.stringify(newData, null, 2));
            return { success: true };
        }

        await this.calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });
        return { success: true };
    }
}

export const googleCalendar = new GoogleCalendarService();
