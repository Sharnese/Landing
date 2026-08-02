export const BRAND = {
  name: 'MyHCBS',
  primarySlogan: 'Quality. Compliance. Care. All in One System.',
  secondarySlogan: 'Built for Compliance. Designed for Care.',
  supportEmail: 'support@myhcbs.com',
  urls: {
    login: 'https://app.myhcbs.com/login',
    signup: 'https://app.myhcbs.com/signup',
    getStarted: 'https://app.myhcbs.com/signup',
  },
  colors: {
    blue: '#116AEF',
    lightBlue: '#EFF6FF',
    lightGrey: '#F4F5FB',
    darkGrey: '#2C2F33',
    darkGrey600: '#444749',
    darkBlue: '#0F172A',
    red: '#FF4444',
    lightGreen: '#ACFFF3',
    green: '#006F51',
  },
  bookingUrl: 'https://famous.ai/api/crm/6a2d56c6be5fbd91f6b0154e/calendar/public?calendarId=89524e1f-2d55-44cf-814b-f11ae016f394&view=booking',
};

export const CRM_SUBSCRIBE = 'https://famous.ai/api/crm/6a2d56c6be5fbd91f6b0154e/subscribe';

export async function crmSubscribe(opts: {
  email: string; name?: string; phone?: string; sms_opt_in?: boolean; source: string; tags?: string[];
}) {
  try {
    await fetch(CRM_SUBSCRIBE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: opts.email,
        name: opts.name || undefined,
        phone: opts.phone || undefined,
        sms_opt_in: opts.sms_opt_in === true,
        source: opts.source,
        tags: opts.tags || [],
      }),
    });
  } catch (e) {
    // non-blocking
  }
}

export const SERVICE_TYPES = [
  'Foster Care', 'Behavioral Health', 'IDD Services', 'Residential Programs',
  'Home Care', 'Adult Services', 'Healthcare Services', 'Human Services', 'Compliance Programs',
];

export const VALUE_PILLS = [
  'Compliance Dashboard', 'Compliance Manager', 'AI Trend Insights', 'Custom Forms',
  'Records Management', 'Incident Tracking', 'Reports & Analytics', 'Staff Credentialing',
  'Visit Verification (EVV)', 'eMAR', 'Client Portal', 'Task Management',
  'Company Infrastructure', 'Knowledge-Based Chat', 'Training & Onboarding', 'Help Desk',
];
