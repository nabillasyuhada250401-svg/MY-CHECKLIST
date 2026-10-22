import { ChecklistItem } from '../types';
import { getAccessToken } from './firebaseAuth';

interface CreateCalendarEventParams {
  title: string;
  categoryName: string;
  dateStr: string; // YYYY-MM-DD
  timeStr?: string; // HH:mm
  durationMinutes?: number;
  description?: string;
  reminderMinutes?: number;
}

export async function createGoogleCalendarEvent(params: CreateCalendarEventParams): Promise<{ id: string; htmlLink: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum terhubung ke Google Calendar. Silakan Masuk dengan Google terlebih dahulu.');
  }

  const time = params.timeStr || '08:00';
  const duration = params.durationMinutes || 30;
  const [hours, minutes] = time.split(':').map(Number);

  const [year, month, day] = params.dateStr.split('-').map(Number);
  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const eventPayload = {
    summary: params.title,
    description: `Kategori: ${params.categoryName}\n${params.description || ''}\n(Dibuat via Checklist Harian & Pengingat)`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: params.reminderMinutes ?? 15 },
      ],
    },
    colorId: params.categoryName === 'SALAT' ? '2' : '9', // green / blueberry
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal menyinkronkan event: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    htmlLink: data.htmlLink,
  };
}

export async function deleteGoogleCalendarEvent(eventId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum terhubung ke Google Calendar.');
  }

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error('Gagal menghapus event dari Google Calendar');
  }

  return true;
}

/**
 * Generate iCalendar (.ics) file string with VEVENT and VALARM (automatic reminders)
 */
export function generateICSContent(dateStr: string, items: ChecklistItem[]): string {
  const [year, month, day] = dateStr.split('-').map(Number);

  const events = items
    .filter(item => item.scheduledTime)
    .map(item => {
      const [h, m] = (item.scheduledTime || '08:00').split(':').map(Number);
      const start = new Date(year, month - 1, day, h, m);
      const end = new Date(start.getTime() + (item.durationMinutes || 30) * 60 * 1000);

      const formatICSDate = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      return [
        'BEGIN:VEVENT',
        `UID:${item.id}-${dateStr}@checklistharian.local`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `SUMMARY:${item.title}`,
        `DESCRIPTION:Checklist Harian (${item.category.toUpperCase()}) - ${item.notes || ''}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'ACTION:DISPLAY',
        `DESCRIPTION:Pengingat: ${item.title}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Checklist Harian//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Download .ics file directly to user device
 */
export function downloadICSFile(dateStr: string, items: ChecklistItem[], filename = `checklist-${dateStr}.ics`) {
  const ics = generateICSContent(dateStr, items);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate direct Google Calendar web create URL
 */
export function getGoogleCalendarWebUrl(dateStr: string, item: ChecklistItem): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [h, m] = (item.scheduledTime || '08:00').split(':').map(Number);
  const start = new Date(year, month - 1, day, h, m);
  const end = new Date(start.getTime() + (item.durationMinutes || 30) * 60 * 1000);

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const datesParam = `${formatGCalDate(start)}/${formatGCalDate(end)}`;
  const textParam = encodeURIComponent(item.title);
  const detailsParam = encodeURIComponent(`Checklist Harian [${item.category.toUpperCase()}] ${item.notes || ''}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${textParam}&dates=${datesParam}&details=${detailsParam}`;
}
