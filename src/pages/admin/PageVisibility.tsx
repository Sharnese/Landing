import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PAGE_SETTINGS } from '@/lib/pageSettings';
import { PageHeader, Card } from './ui';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

type Row = { key: string; label: string; description: string | null; visible: boolean };

const PageVisibility: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('mq_page_settings').select('*').order('label', { ascending: true });
    const byKey: Record<string, Row> = {};
    (data || []).forEach((r: any) => { byKey[r.key] = r; });
    // Make sure every known page shows up even if the row hasn't been created yet.
    const merged = PAGE_SETTINGS.map((p) => byKey[p.key] || { key: p.key, label: p.label, description: p.description, visible: p.defaultVisible });
    setRows(merged);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (row: Row) => {
    setSavingKey(row.key);
    const next = !row.visible;
    setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, visible: next } : r)));
    await supabase.from('mq_page_settings').upsert({
      key: row.key,
      label: row.label,
      description: row.description,
      visible: next,
      updated_at: new Date().toISOString(),
    });
    setSavingKey(null);
  };

  return (
    <div>
      <PageHeader title="Page Visibility" sub="Turn optional public pages on or off. Hidden pages redirect visitors back to the homepage." />
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">{row.label}</div>
                  {row.description && <div className="text-xs text-slate-500 mt-0.5">{row.description}</div>}
                </div>
                <button
                  onClick={() => toggle(row)}
                  disabled={savingKey === row.key}
                  className={`shrink-0 inline-flex items-center gap-2 text-[13px] font-semibold px-3.5 py-2 rounded-full transition ${row.visible ? 'bg-[#ECFDF5] text-[#006F51]' : 'bg-slate-100 text-slate-400'}`}
                >
                  {savingKey === row.key ? <Loader2 className="w-4 h-4 animate-spin" /> : row.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {row.visible ? 'Visible' : 'Hidden'}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PageVisibility;
