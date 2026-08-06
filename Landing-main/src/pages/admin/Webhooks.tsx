import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Badge, Empty, Btn } from './ui';
import { RefreshCw } from 'lucide-react';

const SAMPLE = {
  subscriber_id: 'SUB-1024', company_name: 'Acme Human Services', primary_contact_first_name: 'Jane',
  primary_contact_last_name: 'Smith', primary_contact_email: 'jane@acme.org', primary_contact_phone: '(555) 010-2030',
  subscription_status: 'active', plan_type: 'Enterprise', signup_date: new Date().toISOString(),
  organization_type: 'Non-Profit', service_types: ['Foster Care', 'Behavioral Health'], estimated_user_count: '51–100',
  states_operating_in: ['PA', 'NJ'], primary_compliance_area: 'ODP', assigned_account_specialist: null,
  official_app_customer_url: 'https://app.myhcbs.com/customers/SUB-1024',
};

const Webhooks: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<any>(null);
  const load = async () => { const { data } = await supabase.from('mq_webhook_logs').select('*').order('received_at', { ascending: false }); setRows(data || []); };
  useEffect(() => { load(); }, []);

  const sendTest = async () => {
    setBusy(true);
    await supabase.functions.invoke('new-subscriber-webhook', { body: SAMPLE });
    setBusy(false); load();
  };

  return (
    <div>
      <PageHeader title="Webhook Logs" sub="Incoming subscriber events from the official MyHCBS app." action={<div className="flex gap-2"><Btn variant="ghost" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Btn><Btn onClick={sendTest}>{busy ? 'Sending…' : 'Send Test Payload'}</Btn></div>} />
      <Card className="p-4 mb-4">
        <div className="text-xs font-semibold text-[#444749] mb-1">Webhook Endpoint (POST)</div>
        <code className="text-xs text-[#116AEF] break-all">/functions/v1/new-subscriber-webhook</code>
        <p className="text-[11px] text-slate-400 mt-1">Validates payload, stores subscriber, creates onboarding appointment request + lead, and notifies admin.</p>
      </Card>
      <Card className="overflow-hidden">
        {rows.length === 0 ? <Empty text="No webhook events yet. Use 'Send Test Payload' to simulate one." /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="bg-[#F4F5FB] text-left text-[11px] uppercase tracking-wide text-slate-500">{['Source', 'Status', 'Received', 'Error', ''].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[#F4F5FB]/50">
                  <td className="px-4 py-3 text-xs text-slate-600">{r.source}</td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.received_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-[#FF4444]">{r.error_message || '—'}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => setView(r)} className="text-[#116AEF] text-xs font-semibold">View Payload</button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Card>
      {view && (
        <div className="fixed inset-0 z-[2000] bg-black/55 flex items-center justify-center p-5" onClick={() => setView(null)}>
          <div className="bg-white rounded-2xl max-w-[560px] w-full max-h-[80vh] overflow-auto p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-3 text-[#0F172A]">Payload</h3>
            <pre className="text-xs bg-[#F4F5FB] p-3 rounded-lg overflow-auto">{JSON.stringify(view.payload, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Webhooks;
