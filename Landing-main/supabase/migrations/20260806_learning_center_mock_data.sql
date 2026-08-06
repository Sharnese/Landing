-- ============================================================================
-- Mock data for the Learning Center
-- ============================================================================
-- Run this AFTER the main migration (20260804_page_settings_learning_pricing.sql).
-- It adds a couple of placeholder videos and files to each of the 3 starter
-- modules, purely so you can see the real structure (module -> videos + files)
-- rendered on the page before replacing them with real uploads from
-- Admin -> Learning Center.
--
-- These use example.com placeholder links, not real files — clicking them
-- won't play a video or download anything meaningful. Delete or edit each
-- one from Admin -> Learning Center whenever you're ready.
-- ============================================================================

insert into mq_learning_resources (module_id, kind, title, url, sort_order)
select m.id, r.kind, r.title, r.url, r.sort_order
from mq_learning_modules m
join (values
  ('Getting Started', 'video', 'Platform Overview',        'https://example.com/videos/platform-overview.mp4', 0),
  ('Getting Started', 'video', 'Your First Login',         'https://example.com/videos/first-login.mp4', 1),
  ('Getting Started', 'file',  'Getting Started Guide.pdf','https://example.com/files/getting-started-guide.pdf', 0),

  ('Compliance Dashboard', 'video', 'Dashboard Tour',            'https://example.com/videos/dashboard-tour.mp4', 0),
  ('Compliance Dashboard', 'video', 'Reading Compliance Scores', 'https://example.com/videos/compliance-scores.mp4', 1),
  ('Compliance Dashboard', 'file',  'Compliance Dashboard Manual.pdf', 'https://example.com/files/compliance-dashboard-manual.pdf', 0),

  ('Form Builder', 'video', 'Building a Form',      'https://example.com/videos/building-a-form.mp4', 0),
  ('Form Builder', 'video', 'Publishing Forms',     'https://example.com/videos/publishing-forms.mp4', 1),
  ('Form Builder', 'file',  'Form Builder Manual.pdf', 'https://example.com/files/form-builder-manual.pdf', 0)
) as r(module_name, kind, title, url, sort_order) on r.module_name = m.name
where not exists (select 1 from mq_learning_resources existing where existing.module_id = m.id);

-- Turn Learning Center on so you can see it live at /learning-center while
-- you review the mock data. Flip it back to hidden in
-- Admin -> Page Visibility whenever you want it off again.
update mq_page_settings set visible = true, updated_at = now() where key = 'learning_center';
