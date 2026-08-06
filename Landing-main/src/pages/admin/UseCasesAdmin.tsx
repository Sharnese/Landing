import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Btn, Modal, Field, Empty, inputCls, Badge } from './ui';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

type UseCase = {
  id?: string; title: string; slug: string; industry: string; summary: string;
  content: string; tags: string[]; image_url: string; is_published: boolean; author: string;
};

const blank: UseCase = { title: '', slug: '', industry: '', summary: '', content: '', tags: [], image_url: '', is_published: false, author: '' };
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const UseCasesAdmin: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<UseCase>(blank);
  const [tagsStr, setTagsStr] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('mq_use_cases').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    const ids = (data || []).map((d: any) => d.id);
    if (ids.length) {
      const { data: r } = await supabase.from('mq_use_case_ratings').select('use_case_id').in('use_case_id', ids);
      const c: Record<string, number> = {};
      (r || []).forEach((row: any) => { c[row.use_case_id] = (c[row.use_case_id] || 0) + 1; });
      setCounts(c);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(blank); setTagsStr(''); setErr(''); setOpen(true); };
  const openEdit = (u: any) => { setForm({ ...blank, ...u, tags: u.tags || [] }); setTagsStr((u.tags || []).join(', ')); setErr(''); setOpen(true); };

  const save = async () => {
    if (!form.title) { setErr('Title is required.'); return; }
    setBusy(true); setErr('');
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      industry: form.industry || null,
      summary: form.summary || null,
      content: form.content || null,
      tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
      image_url: form.image_url || null,
      is_published: form.is_published,
      author: form.author || null,
    };
    let error;
    if (form.id) ({ error } = await supabase.from('mq_use_cases').update(payload).eq('id', form.id));
    else ({ error } = await supabase.from('mq_use_cases').insert(payload));
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this use case? This also removes its ratings.')) return;
    await supabase.from('mq_use_cases').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <PageHeader title="Use Cases" sub="Manage published use case blog posts shown on /use-cases." action={<Btn onClick={openNew}><Plus className="w-4 h-4" /> New Use Case</Btn>} />
      <Card className="overflow-hidden">
        {loading ? <div className="flex justify-center py-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
        : items.length === 0 ? <Empty text="No use cases yet. Create your first one." />
        : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3">Title</th><th className="px-5 py-3">Industry</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Ratings</th><th className="px-5 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-[#F4F5FB]/50">
                  <td className="px-5 py-3 font-semibold text-[#0F172A]">{u.title}<div className="text-[11px] text-slate-400 font-normal">/{u.slug}</div></td>
                  <td className="px-5 py-3 text-slate-500">{u.industry || '—'}</td>
                  <td className="px-5 py-3"><Badge status={u.is_published ? 'Published' : 'Draft'} /></td>
                  <td className="px-5 py-3 text-slate-500">{counts[u.id] || 0}</td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(u)} className="text-slate-400 hover:text-[#116AEF] mr-3"><Pencil className="w-4 h-4 inline" /></button>
                    <button onClick={() => remove(u.id)} className="text-slate-400 hover:text-[#FF4444]"><Trash2 className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Edit Use Case' : 'New Use Case'} wide>
        <Field label="Title *"><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} /></Field>
        <Field label="Slug"><input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="auto-generated from title" /></Field>
        <Field label="Industry / Service Type"><input className={inputCls} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></Field>
        <Field label="Summary"><textarea className={inputCls} rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></Field>
        <Field label="Content"><textarea className={inputCls} rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
        <Field label="Tags (comma separated)"><input className={inputCls} value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} /></Field>
        <Field label="Image URL"><input className={inputCls} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></Field>
        <Field label="Author"><input className={inputCls} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-sm text-[#444749] mb-4"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="accent-[#116AEF]" /> Published</label>
        {err && <p className="text-xs text-[#FF4444] mb-3">{err}</p>}
        <div className="flex gap-3"><Btn onClick={save} className="flex-1 justify-center">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Save</Btn><Btn variant="ghost" onClick={() => setOpen(false)} className="flex-1 justify-center">Cancel</Btn></div>
      </Modal>
    </div>
  );
};

export default UseCasesAdmin;
