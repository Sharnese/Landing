// Single source of truth for which optional public pages/tabs exist and can be
// toggled on or off from the admin. Backed by the `mq_page_settings` table.
//
// `visible` here is only the fallback used before the table has loaded (or if
// a row is missing) — the real value always comes from the database once
// PageVisibilityProvider has fetched it.

export type PageSettingKey = 'learning_center' | 'pricing' | 'use_cases';

export type PageSettingDef = {
  key: PageSettingKey;
  label: string;
  description: string;
  defaultVisible: boolean;
};

export const PAGE_SETTINGS: PageSettingDef[] = [
  {
    key: 'learning_center',
    label: 'Learning Center',
    description: 'Public training videos, digital manuals, and module resources.',
    defaultVisible: false,
  },
  {
    key: 'pricing',
    label: 'Pricing',
    description: 'Public pricing and subscription plans page.',
    defaultVisible: true,
  },
  {
    key: 'use_cases',
    label: 'Use Cases',
    description: 'Public industry use case articles.',
    defaultVisible: true,
  },
];

export const DEFAULT_VISIBILITY: Record<string, boolean> = PAGE_SETTINGS.reduce(
  (acc, p) => ({ ...acc, [p.key]: p.defaultVisible }),
  {},
);
