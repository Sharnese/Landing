import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Badge, Btn, Modal, Field, inputCls, Empty } from './ui';
import { Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['New Subscriber', 'Onboarding Requested', 'Onboarding Scheduled', 'Onboarding Completed', 'Active', 'Cancelled', 'Archived'];
const errMsg = (e: any) => e?.message || (typeof e === 'string' ? e : 'Something went wrong.');

const Subscribers: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('mq_subscribers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      console.error('Load subscribers failed:', e);
      toast.error('Could not load subscribers: ' + errMsg(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('mq_subscribers').update({
        subscription_status: edit.subscription_status, onboarding_status: edit.onboarding_status,
        assigned_specialist: edit.assigned_specialist, plan_type: edit.plan_type,
      }).eq('id', edit.id);
      if (error) throw error;
      toast.success('Subscriber saved.');
      setEdit(null); load();
    } catch (e: any) {
      console.error('Save subscriber failed:', e);
      toast.error('Save failed: ' + errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Subscribers & Customers" sub="Subscriber records received from the official MyHCBS app via webhook." />
      <Card className="overflow-hidden">
        {rows.length === 0 ? <Empty text="No subscribers yet. Records arrive automatically via the new-subscriber webhook." /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="bg-[#F4F5FB] text-left text-[11px] uppercase tracking-wide text-slate-500">
              {['Company', 'Contact', 'Plan', 'Subscription', 'Onboarding', 'Specialist', ''].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[#F4F5FB]/50">
                  <td className="px-4 py-3 font-semibold text-[#0F172A]">{r.company_name}<div className="text-[11px] text-slate-400 font-normal">{r.subscriber_id}</div></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{r.contact_name}<div>{r.contact_email}</div></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.plan_type || '—'}</td>
                  <td className="px-4 py-3"><Badge status={r.subscription_status} /></td>
                  <td className="px-4 py-3"><Badge status={r.onboarding_status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.assigned_specialist || '—'}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => setEdit({ ...r })} className="text-[#116AEF] hover:bg-[#EFF6FF] p-1.5 rounded"><Eye className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Subscriber Details" wide>
        {edit && (
          <div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><div className="text-xs text-slate-400">Company</div><div className="font-semibold">{edit.company_name}</div></div>
              <div><div className="text-xs text-slate-400">Contact</div><div className="font-semibold">{edit.contact_name}</div></div>
              <div><div className="text-xs text-slate-400">Email</div><div>{edit.contact_email}</div></div>
              <div><div className="text-xs text-slate-400">Phone</div><div>{edit.contact_phone}</div></div>
              <div><div className="text-xs text-slate-400">Org Type</div><div>{edit.organization_type || '—'}</div></div>
              <div><div className="text-xs text-slate-400">Users</div><div>{edit.estimated_user_count || '—'}</div></div>
              <div><div className="text-xs text-slate-400">Services</div><div>{(edit.service_types || []).join(', ') || '—'}</div></div>
              <div><div className="text-xs text-slate-400">States</div><div>{(edit.states || []).join(', ') || '—'}</div></div>
              <div><div className="text-xs text-slate-400">Compliance Area</div><div>{edit.primary_compliance_area || '—'}</div></div>
              <div><div className="text-xs text-slate-400">Source</div><div>{edit.source}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Subscription Status"><select className={inputCls} value={edit.subscription_status} onChange={(e) => setEdit({ ...edit, subscription_status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Onboarding Status"><select className={inputCls} value={edit.onboarding_status} onChange={(e) => setEdit({ ...edit, onboarding_status: e.target.value })}>{['Onboarding Requested', 'Onboarding Scheduled', 'Onboarding Completed', 'Active'].map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Plan Type"><input className={inputCls} value={edit.plan_type || ''} onChange={(e) => setEdit({ ...edit, plan_type: e.target.value })} /></Field>
              <Field label="Assigned Specialist"><input className={inputCls} value={edit.assigned_specialist || ''} onChange={(e) => setEdit({ ...edit, assigned_specialist: e.target.value })} /></Field>
            </div>
            {edit.official_app_url && <a href={edit.official_app_url} target="_blank" rel="noreferrer" className="text-xs text-[#116AEF] underline">View in official app</a>}
            <div className="flex justify-end gap-2 mt-4"><Btn variant="ghost" onClick={() => setEdit(null)}>Close</Btn><Btn onClick={save}>{saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save'}</Btn></div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Subscribers;
