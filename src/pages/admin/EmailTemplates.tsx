import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Btn, Modal, Field, inputCls, Badge, Empty } from './ui';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const VARS = ['{{name}}', '{{company}}', '{{appointment_title}}', '{{appointment_date}}', '{{appointment_time}}', '{{meeting_link}}', '{{admin_name}}', '{{account_specialist_name}}'];
const errMsg = (e: any) => e?.message || (typeof e === 'string' ? e : 'Something went wrong.');

const EmailTemplates: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const { data, error } = await supabase.from('mq_email_templates').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      console.error('Load templates failed:', e);
      toast.error('Could not load templates: ' + errMsg(e));
    }
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    setSaving(true);
    try {
      const p = { ...edit, updated_at: new Date().toISOString() }; const id = p.id; delete p.id;
      if (id) { const { error } = await supabase.from('mq_email_templates').update(p).eq('id', id); if (error) throw error; }
      else { const { error } = await supabase.from('mq_email_templates').insert(p); if (error) throw error; }
      toast.success('Template saved.');
      setEdit(null); load();
    } catch (e: any) {
      console.error('Save template failed:', e);
      toast.error('Save failed: ' + errMsg(e));
    } finally {
      setSaving(false);
    }
  };
  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    try {
      const { error } = await supabase.from('mq_email_templates').delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted.'); load();
    } catch (e: any) {
      console.error('Delete template failed:', e);
      toast.error('Delete failed: ' + errMsg(e));
    }
  };

  return (
    <div>
      <PageHeader title="Email Templates" sub="Placeholder templates for system notifications and confirmations." action={<Btn onClick={() => setEdit({ name: '', subject: '', body: '', variables: VARS.join(', '), status: 'Active' })}><Plus className="w-4 h-4" /> New</Btn>} />
      <div className="mb-4 p-3 bg-[#EFF6FF] border border-[#116AEF]/20 rounded-xl text-xs text-[#116AEF]">Available variables: {VARS.join('  ·  ')}</div>
      <Card className="p-2">
        {rows.length === 0 ? <Empty /> : (
          <div className="divide-y divide-slate-50">
            {rows.map((r) => (
              <div key={r.id} className="flex items-start justify-between p-3.5">
                <div><div className="text-sm font-semibold text-[#0F172A]">{r.name}</div><div className="text-xs text-slate-500">{r.subject}</div><div className="mt-1"><Badge status={r.status} /></div></div>
                <div className="flex gap-1"><button onClick={() => setEdit({ ...r })} className="text-[#116AEF] hover:bg-[#EFF6FF] p-1.5 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => del(r.id)} className="text-[#FF4444] hover:bg-[#FF4444]/10 p-1.5 rounded"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit Template' : 'New Template'} wide>
        {edit && (
          <div>
            <Field label="Template Name"><input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Subject"><input className={inputCls} value={edit.subject} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} /></Field>
            <Field label="Body"><textarea className={inputCls + ' min-h-[120px]'} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} /></Field>
            <Field label="Variables"><input className={inputCls} value={edit.variables} onChange={(e) => setEdit({ ...edit, variables: e.target.value })} /></Field>
            <Field label="Status"><select className={inputCls} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{['Active', 'Draft'].map((s) => <option key={s}>{s}</option>)}</select></Field>
            <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={save}>{saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save'}</Btn></div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmailTemplates;
