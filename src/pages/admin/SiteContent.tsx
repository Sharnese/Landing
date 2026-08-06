import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Btn, Field, inputCls } from './ui';

const FIELDS: [string, string, boolean][] = [
  ['heroHeadline', 'Hero Headline', false],
  ['heroSubheadline', 'Hero Subheadline', true],
  ['featuresIntro', 'Features Section Description', true],
  ['solutionsIntro', 'Solutions Section Description', true],
  ['onboardingIntro', 'Onboarding Section Text', true],
  ['contactEmail', 'Contact Email', false],
  ['ctaText', 'Primary CTA Text', false],
  ['footerNote', 'Footer Note', true],
];

const SiteContent: React.FC = () => {
  const [content, setContent] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { supabase.from('mq_site_content').select('content').eq('id', 1).maybeSingle().then(({ data }) => setContent(data?.content || {})); }, []);

  const save = async () => { await supabase.from('mq_site_content').update({ content }).eq('id', 1); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <PageHeader title="Site Content" sub="Edit landing page copy. Defaults are used when fields are left blank." />
      <Card className="p-6 max-w-[640px]">
        {FIELDS.map(([k, label, area]) => (
          <Field key={k} label={label}>
            {area ? <textarea className={inputCls + ' min-h-[70px]'} value={content[k] || ''} onChange={(e) => setContent({ ...content, [k]: e.target.value })} />
              : <input className={inputCls} value={content[k] || ''} onChange={(e) => setContent({ ...content, [k]: e.target.value })} />}
          </Field>
        ))}
        <div className="flex items-center gap-3 mt-2"><Btn onClick={save}>Save Content</Btn>{saved && <span className="text-xs text-[#006F51] font-semibold">Saved!</span>}</div>
      </Card>
    </div>
  );
};

export default SiteContent;
