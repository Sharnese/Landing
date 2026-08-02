import { supabase } from '@/lib/supabase';

// ---- Standard + customized demo plan ---------------------------------------
// Every demo always opens with these core modules, then continues with the
// customer's selected interests (customized experience).
export const STANDARD_DEMO_MODULES = [
  'Platform Overview',
  'Compliance Dashboard',
  'My Individuals',
  'Form Builder',
];

// Map service-type / interest selections to the customized demo modules shown
// after the standard demonstration.
export const INTEREST_DEMO_MAP: Record<string, string> = {
  'Incident Management': 'Incident Management',
  'Employee Compliance': 'Employee Compliance',
  EVV: 'EVV',
  'Records Management': 'Records Management',
  'Home Care': 'EVV & Visit Verification',
  'Home Health': 'EVV & Clinical Documentation',
  Hospice: 'Care Plans & Compliance',
  IDD: 'My Individuals & ISP Tracking',
  'Behavioral Health': 'Treatment Plans & Compliance',
  'Skilled Nursing': 'Compliance Dashboard & Reporting',
};

export function buildDemoPlan(services: string[], orgType?: string): {
  standard: string[];
  customized: string[];
} {
  const customized: string[] = [];
  (services || []).forEach((s) => {
    const mapped = INTEREST_DEMO_MAP[s];
    if (mapped && !customized.includes(mapped)) customized.push(mapped);
  });
  // Fallback for unsure customers: lead with highest-value modules.
  if (customized.length === 0) {
    customized.push('Records Management', 'Reporting & Analytics');
  }
  return { standard: STANDARD_DEMO_MODULES, customized };
}

// ---- Availability config ----------------------------------------------------
export type AvailabilityConfig = {
  id?: string;
  days_of_week: number[];
  start_time: string; // 'HH:MM' 24h
  end_time: string; // 'HH:MM' 24h
  slot_minutes: number;
  buffer_minutes: number;
  max_per_day: number;
  blocked_dates: string[]; // 'YYYY-MM-DD'
  onetime: { date: string; start: string; end: string }[];
  active: boolean;
  time_zone: string;
};

export async function loadAvailability(): Promise<AvailabilityConfig | null> {
  const { data, error } = await supabase
    .from('mq_demo_availability')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    days_of_week: data.days_of_week || [1, 2, 3, 4, 5],
    start_time: data.start_time || '09:00',
    end_time: data.end_time || '17:00',
    slot_minutes: data.slot_minutes || 45,
    buffer_minutes: data.buffer_minutes || 15,
    max_per_day: data.max_per_day || 6,
    blocked_dates: data.blocked_dates || [],
    onetime: Array.isArray(data.onetime) ? data.onetime : [],
    active: data.active !== false,
    time_zone: data.time_zone || 'Eastern Time (ET)',
  };
}

// ---- Time helpers ------------------------------------------------------------
export function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
}

function buildSlotTimes(cfg: AvailabilityConfig, start: string, end: string): string[] {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const step = cfg.slot_minutes + cfg.buffer_minutes;
  const out: string[] = [];
  for (let t = startMin; t + cfg.slot_minutes <= endMin; t += step) {
    const hh = Math.floor(t / 60);
    const mm = t % 60;
    out.push(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
  }
  return out;
}

export function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Compute selectable calendar dates for the next `days` days.
export function availableDates(cfg: AvailabilityConfig, days = 60): string[] {
  if (!cfg.active) return [];
  const out: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const blocked = new Set(cfg.blocked_dates);
  const oneTimeDates = new Set(cfg.onetime.map((o) => o.date));
  for (let i = 0; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = fmtDate(d);
    if (blocked.has(key)) continue;
    const isWeekly = cfg.days_of_week.includes(d.getDay());
    if (isWeekly || oneTimeDates.has(key)) out.push(key);
  }
  return out;
}

// Get available time slots (12h display labels) for a date, removing booked ones.
export async function slotsForDate(cfg: AvailabilityConfig, date: string): Promise<string[]> {
  // Determine the hour window for that date (one-time overrides weekly).
  const ot = cfg.onetime.find((o) => o.date === date);
  const startH = ot ? ot.start : cfg.start_time;
  const endH = ot ? ot.end : cfg.end_time;
  const all = buildSlotTimes(cfg, startH, endH).map(to12h);

  const { data } = await supabase
    .from('mq_appointments')
    .select('start_time,status')
    .eq('type', 'Demo')
    .eq('date', date);
  const booked = (data || [])
    .filter((r) => !['Cancelled', 'No-Show'].includes(r.status))
    .map((r) => (r.start_time || '').trim());

  // Enforce max_per_day.
  if (cfg.max_per_day && booked.length >= cfg.max_per_day) return [];

  return all.filter((s) => !booked.includes(s));
}

// Check a slot is still free right before booking (race guard).
export async function isSlotFree(date: string, startLabel: string): Promise<boolean> {
  const { data } = await supabase
    .from('mq_appointments')
    .select('id,status')
    .eq('type', 'Demo')
    .eq('date', date)
    .eq('start_time', startLabel);
  const live = (data || []).filter((r) => !['Cancelled', 'No-Show'].includes(r.status));
  return live.length === 0;
}

// ---- Calendar / meeting integration -----------------------------------------
// Build a JS Date from a 'YYYY-MM-DD' + '9:00 AM' label.
function combine(date: string, label: string): Date {
  const m = label.match(/(\d+):(\d+)\s*(AM|PM)/i);
  const [y, mo, d] = date.split('-').map(Number);
  let h = m ? Number(m[1]) : 9;
  const min = m ? Number(m[2]) : 0;
  const ap = m ? m[3].toUpperCase() : 'AM';
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return new Date(y, mo - 1, d, h, min);
}

function fmtICS(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export type CalEvent = {
  title: string;
  date: string;
  startLabel: string;
  durationMin: number;
  description?: string;
  location?: string; // meeting link
};

export function buildCalendarLinks(ev: CalEvent) {
  const start = combine(ev.date, ev.startLabel);
  const end = new Date(start.getTime() + ev.durationMin * 60000);
  const enc = encodeURIComponent;
  const desc = ev.description || '';
  const loc = ev.location || '';

  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(ev.title)}&dates=${fmtICS(start)}/${fmtICS(end)}&details=${enc(desc)}&location=${enc(loc)}`;
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${enc(ev.title)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${enc(desc)}&location=${enc(loc)}`;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MyHCBS//Demo//EN', 'BEGIN:VEVENT',
    `UID:${Date.now()}@myhcbs`, `DTSTAMP:${fmtICS(new Date())}`,
    `DTSTART:${fmtICS(start)}`, `DTEND:${fmtICS(end)}`,
    `SUMMARY:${ev.title}`, `DESCRIPTION:${desc.replace(/\n/g, '\\n')}`,
    loc ? `LOCATION:${loc}` : '', 'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  const icsHref = 'data:text/calendar;charset=utf8,' + encodeURIComponent(ics);

  return { google, outlook, icsHref };
}
