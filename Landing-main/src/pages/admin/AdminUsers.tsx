import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Btn, Modal, Field, inputCls, Badge, Empty } from './ui';
import { useAdminAuth } from '@/contexts/AdminAuth';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const AdminUsers: React.FC<{ specialistOnly?: boolean }> = ({ specialistOnly }) => {
  const { admin } = useAdminAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const roles = specialistOnly
    ? ['Account Specialist']
    : ['Super Admin', 'Admin', 'Account Specialist'];

  const load = async () => {
    const { data } = await supabase.from('admin_profiles').select('*').order('created_at');
    let d = data || [];
    if (specialistOnly) d = d.filter((x) => x.role === 'Account Specialist');
    setRows(d);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [specialistOnly]);

  const callFn = async (payload: any) => {
    const { data, error } = await supabase.functions.invoke('admin-provision', { body: payload });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const save = async () => {
    setErr(''); setBusy(true);
    try {
      if (edit.id) {
        await callFn({
          action: 'update',
          profile_id: edit.id,
          auth_user_id: edit.auth_user_id,
          email: edit.email,
          password: edit.password || undefined,
          full_name: edit.full_name,
          phone: edit.phone,
          role: edit.role,
        });
      } else {
        if (!edit.password || edit.password.length < 6) {
          setErr('Password must be at least 6 characters.'); setBusy(false); return;
        }
        await callFn({
          action: 'create',
          email: edit.email,
          password: edit.password,
          full_name: edit.full_name,
          phone: edit.phone,
          role: edit.role,
        });
      }
      setEdit(null); await load();
    } catch (e: any) {
      setErr(e.message || 'Something went wrong.');
    } finally { setBusy(false); }
  };

  const del = async (r: any) => {
    if (r.auth_user_id === admin?.auth_user_id) { alert("You can't delete your own account."); return; }
    if (!confirm('Delete this user? This removes their login too.')) return;
    try { await callFn({ action: 'delete', profile_id: r.id, auth_user_id: r.auth_user_id }); await load(); }
    catch (e: any) { alert(e.message); }
  };

  const toggleActive = async (r: any) => {
    const status = r.status === 'Active' ? 'Inactive' : 'Active';
    try { await callFn({ action: 'setStatus', profile_id: r.id, status }); await load(); }
    catch (e: any) { alert(e.message); }
  };

  const isSuper = admin?.role === 'Super Admin';

  return (
    <div>
      <PageHeader title={specialistOnly ? 'Account Specialists' : 'Admin Users'} sub={specialistOnly ? 'Specialists manage assigned appointments, onboarding, and subscriber records.' : 'Manage admins, roles, and permissions.'}
        action={isSuper ? <Btn onClick={() => { setErr(''); setEdit({ email: '', password: '', full_name: '', phone: '', role: specialistOnly ? 'Account Specialist' : 'Admin', status: 'Active' }); }}><Plus className="w-4 h-4" /> Add</Btn> : undefined} />
      <Card className="overflow-hidden">
        {rows.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="bg-[#F4F5FB] text-left text-[11px] uppercase tracking-wide text-slate-500">{['Name', 'Email', 'Role', 'Status', ''].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[#F4F5FB]/50">
                  <td className="px-4 py-3 font-semibold text-[#0F172A]">{r.full_name}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{r.email}</td>
                  <td className="px-4 py-3"><span className="text-[11px] bg-[#EFF6FF] text-[#116AEF] px-2.5 py-1 rounded-full">{r.role}</span></td>
                  <td className="px-4 py-3"><Badge status={r.status === 'Active' ? 'Active' : 'Cancelled'} /></td>
                  <td className="px-4 py-3 text-right">
                    {isSuper && <>
                      <button onClick={() => toggleActive(r)} className="text-xs font-semibold text-slate-500 hover:text-[#116AEF] mr-2">{r.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => { setErr(''); setEdit({ ...r, password: '' }); }} className="text-[#116AEF] hover:bg-[#EFF6FF] p-1.5 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => del(r)} className="text-[#FF4444] hover:bg-[#FF4444]/10 p-1.5 rounded ml-1"><Trash2 className="w-4 h-4" /></button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit User' : 'Add User'}>
        {edit && (
          <div>
            {err && <div className="mb-3 text-sm text-[#FF4444] bg-[#FF4444]/10 rounded-lg px-3 py-2">{err}</div>}
            <Field label="Name"><input className={inputCls} value={edit.full_name || ''} onChange={(e) => setEdit({ ...edit, full_name: e.target.value })} /></Field>
            <Field label="Email"><input className={inputCls} value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
            <Field label="Phone"><input className={inputCls} value={edit.phone || ''} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
            <Field label={edit.id ? 'New Password (leave blank to keep)' : 'Password'}><input type="password" className={inputCls} value={edit.password || ''} onChange={(e) => setEdit({ ...edit, password: e.target.value })} /></Field>
            <Field label="Role"><select className={inputCls} value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>{roles.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
            <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Btn></div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
