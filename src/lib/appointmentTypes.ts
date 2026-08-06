// Single source of truth for appointment "type" values, shared between the
// admin Appointments manager and the public booking page. Keeping this in one
// place prevents the two sides from drifting apart — e.g. the admin side
// saving a session as "New Customer Training" while the public page only
// looked for the literal type "Training", which silently hid every session.

export type AppointmentTabCfg = {
  key: string;
  label: string;
  title: string;
  sub: string;
  types: string[];
  defaultType: string;
  typeFilter: string[];
  publicSlug: string;
};

export const APPOINTMENT_TABS: AppointmentTabCfg[] = [
  {
    key: 'appointments',
    label: 'Appointments',
    title: 'Appointments',
    sub: 'Demos, onboarding, walkthroughs, and general appointments.',
    types: ['Demo', 'Onboarding', 'Q&A Session', 'Product Walkthrough', 'General Appointment'],
    defaultType: 'General Appointment',
    typeFilter: ['Demo', 'Onboarding', 'Q&A Session', 'Product Walkthrough', 'General Appointment'],
    publicSlug: 'appointment',
  },
  {
    key: 'office-hours',
    label: 'Office Hours',
    title: 'Office Hours',
    sub: 'Live office hours sessions.',
    types: ['Office Hours'],
    defaultType: 'Office Hours',
    typeFilter: ['Office Hours'],
    publicSlug: 'office-hours',
  },
  {
    key: 'training',
    label: 'Training Sessions',
    title: 'Training Sessions',
    sub: 'Customer and department training.',
    types: ['New Customer Training', 'Department Training', 'Program Training', 'Form Builder Training', 'Dashboard Training', 'Reporting Training', 'Compliance Training', 'EVV Training', 'Knowledge Base Training', 'Custom Training', 'Training'],
    defaultType: 'New Customer Training',
    typeFilter: ['Training', 'New Customer Training', 'Department Training', 'Program Training', 'Form Builder Training', 'Dashboard Training', 'Reporting Training', 'Compliance Training', 'EVV Training', 'Knowledge Base Training', 'Custom Training'],
    publicSlug: 'training',
  },
  {
    key: 'events',
    label: 'Events',
    title: 'Events',
    sub: 'Custom events and registrations.',
    types: ['Custom Event'],
    defaultType: 'Custom Event',
    typeFilter: ['Custom Event'],
    publicSlug: 'event',
  },
];

// Look up a tab's config by the slug used in public booking URLs
// (/book/appointment, /book/office-hours, /book/training, /book/event).
export const getAppointmentTabBySlug = (slug: string): AppointmentTabCfg | undefined =>
  APPOINTMENT_TABS.find((t) => t.publicSlug === slug);
