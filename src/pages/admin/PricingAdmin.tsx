import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Btn, Modal, Field, Empty, inputCls } from './ui';
import { Plus, Pencil, Trash2, Loader2, Star, ArrowUp, ArrowDown } from 'lucide-react';

type Plan = {
  id?: string; name: string; price_label: string; billing_note: string; description: string;
  features: string[]; cta_label: string; highlighted: boolean; sort_order: number;
};

const blank: Plan = { name: '', price_label: '', billing_note: '', description: '', features: [], cta_label: 'Book a Demo', highlighted: false, sort_order: 0 };

const PricingAdmin: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Plan>(blank);
  const [featuresStr, setFeaturesStr] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('mq_pricing_plans').select('*').order('sort_order', { ascending: true });
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...blank, sort_order: items.length }); setFeaturesStr(''); setErr(''); setOpen(true); };
  const openEdit = (p: any) => { setForm({ ...blank, ...p, features: p.features || [] }); setFeaturesStr((p.features || []).join('\n')); setErr(''); setOpen(true); };

  const save = async () => {
    if (!form.name || !form.price_label) { setErr('Plan name and price are required.'); return; }
    setBusy(true); setErr('');
    const payload = {
      name: form.name,
      price_label: form.price_label,
      billing_note: form.billing_note || null,
      description: form.description || null,
      features: featuresStr.split('\n').map((f) => f.trim()).filter(Boolean),
      cta_label: form.cta_label || 'Book a Demo',
      highlighted: form.highlighted,
      sort_order: form.sort_order ?? 0,
    };
    let error;
    if (form.id) ({ error } = await supabase.from('mq_pricing_plans').update(payload).eq('id', form.id));
    else ({ error } = await supabase.from('mq_pricing_plans').insert(payload));
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this plan? It will immediately disappear from the public Pricing page.')) return;
    await supabase.from('mq_pricing_plans').delete().eq('id', id);
    load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const a = items[idx], b = items[swapIdx];
    await Promise.all([
      supabase.from('mq_pricing_plans').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('mq_pricing_plans').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Pricing"
        sub="What visitors see on the public /pricing page. This does not change anything in Stripe or your actual billing — it only changes the displayed plans and features."
        action={<Btn onClick={openNew}><Plus className="w-4 h-4" /> New Plan</Btn>}
      />
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : items.length === 0 ? (
          <Empty text="No pricing plans yet. Create your first one." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                <th className="px-5 py-3">Order</th><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Features</th><th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p, idx) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-[#F4F5FB]/50">
                  <td className="px-5 py-3 whitespace-nowrap">
                    <button onClick={() => move(idx, -1)} disabled={idx === 0} className="text-slate-400 hover:text-[#116AEF] disabled:opacity-30 mr-1"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="text-slate-400 hover:text-[#116AEF] disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#0F172A]">
                    {p.name} {p.highlighted && <Star className="w-3.5 h-3.5 text-[#F59E0B] inline fill-current ml-1" />}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{p.price_label}</td>
                  <td className="px-5 py-3 text-slate-500">{(p.features || []).length} listed</td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-[#116AEF] mr-3"><Pencil className="w-4 h-4 inline" /></button>
                    <button onClick={() => remove(p.id)} className="text-slate-400 hover:text-[#FF4444]"><Trash2 className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Edit Plan' : 'New Plan'} wide>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Plan Name *"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Professional" /></Field>
          <Field label="Price Label *"><input className={inputCls} value={form.price_label} onChange={(e) => setForm({ ...form, price_label: e.target.value })} placeholder="$1,299/mo or Custom" /></Field>
        </div>
        <Field label="Billing Note"><input className={inputCls} value={form.billing_note} onChange={(e) => setForm({ ...form, billing_note: e.target.value })} placeholder="Per organization, billed monthly. Up to 100 staff." /></Field>
        <Field label="Description"><textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Field label="Features (one per line)"><textarea className={inputCls} rows={7} value={featuresStr} onChange={(e) => setFeaturesStr(e.target.value)} placeholder={'Everything in Starter\nVisit Verification (EVV)\neMAR'} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Button Label"><input className={inputCls} value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} placeholder="Book a Demo" /></Field>
          <label className="flex items-center gap-2 text-sm text-[#444749] mt-7"><input type="checkbox" checked={form.highlighted} onChange={(e) => setForm({ ...form, highlighted: e.target.checked })} className="accent-[#116AEF]" /> Highlight as "Most Popular"</label>
        </div>
        {err && <p className="text-xs text-[#FF4444] mb-3">{err}</p>}
        <div className="flex gap-3"><Btn onClick={save} className="flex-1 justify-center">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Save</Btn><Btn variant="ghost" onClick={() => setOpen(false)} className="flex-1 justify-center">Cancel</Btn></div>
      </Modal>
    </div>
  );
};

export default PricingAdmin;
