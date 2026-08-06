import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Btn, Modal, Field, inputCls, Badge, Empty } from './ui';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { key: 'kb', label: 'Knowledge Base', table: 'mq_kb' },
  { key: 'q', label: 'Suggested Questions', table: 'mq_suggested_questions' },
  { key: 'links', label: 'Helpful Links', table: 'mq_links' },
];
const errMsg = (e: any) => e?.message || (typeof e === 'string' ? e : 'Something went wrong.');

const ChatbotAdmin: React.FC = () => {
  const [tab, setTab] = useState('kb');
  const [rows, setRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const table = TABS.find((t) => t.key === tab)!.table;

  const load = async () => {
    try {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      console.error('Load failed:', e);
      toast.error('Could not load: ' + errMsg(e));
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const blank = tab === 'kb' ? { title: '', category: '', content: '', keywords: '', status: 'Published', created_by: 'Admin' }
    : tab === 'q' ? { question: '', response: '', category: '', display_order: 0, status: 'Published' }
      : { title: '', url: '', category: '', description: '', new_tab: true, status: 'Published' };

  const save = async () => {
    setSaving(true);
    try {
      const p = { ...edit }; const id = p.id; delete p.id; delete p.created_at;
      if (id) { const { error } = await supabase.from(table).update(p).eq('id', id); if (error) throw error; }
      else { const { error } = await supabase.from(table).insert(p); if (error) throw error; }
      toast.success('Saved.');
      setEdit(null); load();
    } catch (e: any) {
      console.error('Save failed:', e);
      toast.error('Save failed: ' + errMsg(e));
    } finally {
      setSaving(false);
    }
  };
  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted.'); load();
    } catch (e: any) {
      console.error('Delete failed:', e);
      toast.error('Delete failed: ' + errMsg(e));
    }
  };

  return (
    <div>
      <PageHeader title="Chatbot Knowledge" sub="Content used by the public chatbot to answer questions and offer links." action={<Btn onClick={() => setEdit({ ...blank })}><Plus className="w-4 h-4" /> Add</Btn>} />
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => <button key={t.key} onClick={() => setTab(t.key)} className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${tab === t.key ? 'bg-[#116AEF] text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>{t.label}</button>)}
      </div>
      <Card className="p-2">
        {rows.length === 0 ? <Empty /> : (
          <div className="divide-y divide-slate-50">
            {rows.map((r) => (
              <div key={r.id} className="flex items-start justify-between p-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#0F172A]">{r.title || r.question || r.url}</div>
                  <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{r.content || r.response || r.description || r.url}</div>
                  <div className="flex gap-2 mt-1.5 items-center">{r.category && <span className="text-[10px] bg-[#EFF6FF] text-[#116AEF] px-2 py-0.5 rounded-full">{r.category}</span>}<Badge status={r.status} /></div>
                </div>
                <div className="flex gap-1 shrink-0 ml-3">
                  <button onClick={() => setEdit({ ...r })} className="text-[#116AEF] hover:bg-[#EFF6FF] p-1.5 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => del(r.id)} className="text-[#FF4444] hover:bg-[#FF4444]/10 p-1.5 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit' : 'Add'} wide>
        {edit && (
          <div>
            {tab === 'kb' && <>
              <Field label="Title"><input className={inputCls} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
              <Field label="Category"><input className={inputCls} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></Field>
              <Field label="Content"><textarea className={inputCls + ' min-h-[100px]'} value={edit.content} onChange={(e) => setEdit({ ...edit, content: e.target.value })} /></Field>
              <Field label="Keywords (space separated)"><input className={inputCls} value={edit.keywords} onChange={(e) => setEdit({ ...edit, keywords: e.target.value })} /></Field>
            </>}
            {tab === 'q' && <>
              <Field label="Question"><input className={inputCls} value={edit.question} onChange={(e) => setEdit({ ...edit, question: e.target.value })} /></Field>
              <Field label="Response"><textarea className={inputCls + ' min-h-[90px]'} value={edit.response} onChange={(e) => setEdit({ ...edit, response: e.target.value })} /></Field>
              <Field label="Category"><input className={inputCls} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></Field>
              <Field label="Display Order"><input type="number" className={inputCls} value={edit.display_order} onChange={(e) => setEdit({ ...edit, display_order: Number(e.target.value) })} /></Field>
            </>}
            {tab === 'links' && <>
              <Field label="Link Title"><input className={inputCls} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
              <Field label="URL"><input className={inputCls} value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} /></Field>
              <Field label="Category"><input className={inputCls} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></Field>
              <Field label="Description"><input className={inputCls} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
              <label className="flex items-center gap-2 text-xs text-slate-600 mb-3"><input type="checkbox" checked={edit.new_tab} onChange={(e) => setEdit({ ...edit, new_tab: e.target.checked })} className="accent-[#116AEF]" /> Open in new tab</label>
            </>}
            <Field label="Status"><select className={inputCls} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{['Draft', 'Published', 'Archived'].map((s) => <option key={s}>{s}</option>)}</select></Field>
            <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={save}>{saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save'}</Btn></div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatbotAdmin;
