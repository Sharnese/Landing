import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadPublicFile, deletePublicFile } from '@/lib/storageUpload';
import { PageHeader, Card, Btn, Modal, Field, Empty, inputCls } from './ui';
import { Plus, Pencil, Trash2, Loader2, Video, FileText, Upload, ChevronDown, ChevronUp } from 'lucide-react';

type ModuleRow = { id: string; name: string; description: string | null; sort_order: number };
type ResourceRow = { id: string; module_id: string; kind: 'video' | 'file'; title: string; url: string; file_path: string | null };

const LearningCenterAdmin: React.FC = () => {
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [resources, setResources] = useState<Record<string, ResourceRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleForm, setModuleForm] = useState<{ id?: string; name: string; description: string }>({ name: '', description: '' });
  const [moduleErr, setModuleErr] = useState('');
  const [moduleBusy, setModuleBusy] = useState(false);

  // Per-module "add resource" mini-form state, keyed by module id + kind.
  const [addTitle, setAddTitle] = useState<Record<string, string>>({});
  const [addBusy, setAddBusy] = useState<Record<string, boolean>>({});
  const [addErr, setAddErr] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data: mods } = await supabase.from('mq_learning_modules').select('*').order('sort_order', { ascending: true });
    setModules(mods || []);
    const ids = (mods || []).map((m: any) => m.id);
    if (ids.length) {
      const { data: res } = await supabase.from('mq_learning_resources').select('*').in('module_id', ids).order('sort_order', { ascending: true });
      const grouped: Record<string, ResourceRow[]> = {};
      (res || []).forEach((r: any) => { (grouped[r.module_id] = grouped[r.module_id] || []).push(r); });
      setResources(grouped);
    } else {
      setResources({});
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNewModule = () => { setModuleForm({ name: '', description: '' }); setModuleErr(''); setModuleModalOpen(true); };
  const openEditModule = (m: ModuleRow) => { setModuleForm({ id: m.id, name: m.name, description: m.description || '' }); setModuleErr(''); setModuleModalOpen(true); };

  const saveModule = async () => {
    if (!moduleForm.name) { setModuleErr('Module name is required.'); return; }
    setModuleBusy(true); setModuleErr('');
    const payload = { name: moduleForm.name, description: moduleForm.description || null, sort_order: moduleForm.id ? undefined : modules.length };
    let error;
    if (moduleForm.id) ({ error } = await supabase.from('mq_learning_modules').update(payload).eq('id', moduleForm.id));
    else ({ error } = await supabase.from('mq_learning_modules').insert(payload));
    setModuleBusy(false);
    if (error) { setModuleErr(error.message); return; }
    setModuleModalOpen(false); load();
  };

  const removeModule = async (id: string) => {
    if (!confirm('Delete this module? All of its videos and files will be deleted too.')) return;
    const items = resources[id] || [];
    await Promise.all(items.filter((r) => r.file_path).map((r) => deletePublicFile(r.file_path!)));
    await supabase.from('mq_learning_modules').delete().eq('id', id);
    load();
  };

  const removeResource = async (r: ResourceRow) => {
    if (!confirm(`Delete "${r.title}"?`)) return;
    if (r.file_path) await deletePublicFile(r.file_path);
    await supabase.from('mq_learning_resources').delete().eq('id', r.id);
    load();
  };

  const addResource = async (moduleId: string, kind: 'video' | 'file', file: File | null) => {
    const key = `${moduleId}-${kind}`;
    const title = (addTitle[key] || '').trim();
    if (!title) { setAddErr((p) => ({ ...p, [key]: 'Give it a name first.' })); return; }
    if (!file) { setAddErr((p) => ({ ...p, [key]: 'Choose a file to upload.' })); return; }
    setAddBusy((p) => ({ ...p, [key]: true })); setAddErr((p) => ({ ...p, [key]: '' }));
    const folder = `${moduleId}/${kind}s`;
    const result = await uploadPublicFile(file, folder);
    if ('error' in result) {
      setAddBusy((p) => ({ ...p, [key]: false }));
      setAddErr((p) => ({ ...p, [key]: result.error }));
      return;
    }
    const existing = resources[moduleId] || [];
    const { error } = await supabase.from('mq_learning_resources').insert({
      module_id: moduleId, kind, title, url: result.url, file_path: result.path, sort_order: existing.length,
    });
    setAddBusy((p) => ({ ...p, [key]: false }));
    if (error) { setAddErr((p) => ({ ...p, [key]: error.message })); return; }
    setAddTitle((p) => ({ ...p, [key]: '' }));
    load();
  };

  return (
    <div>
      <PageHeader
        title="Learning Center"
        sub="Manage the modules, training videos, and digital manuals shown on the public Learning Center page. Each module can have its own videos and downloadable files."
        action={<Btn onClick={openNewModule}><Plus className="w-4 h-4" /> New Module</Btn>}
      />

      {loading ? (
        <div className="flex justify-center py-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : modules.length === 0 ? (
        <Card><Empty text="No modules yet. Create your first one to start adding videos and manuals." /></Card>
      ) : (
        <div className="space-y-4">
          {modules.map((m) => {
            const isOpen = expanded[m.id] !== false; // default expanded
            const items = resources[m.id] || [];
            const videos = items.filter((r) => r.kind === 'video');
            const files = items.filter((r) => r.kind === 'file');
            return (
              <Card key={m.id} className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
                  <button className="flex items-center gap-2 text-left" onClick={() => setExpanded((p) => ({ ...p, [m.id]: !isOpen }))}>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    <div>
                      <div className="text-sm font-bold text-[#0F172A]">{m.name}</div>
                      {m.description && <div className="text-xs text-slate-500">{m.description}</div>}
                    </div>
                  </button>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => openEditModule(m)} className="text-slate-400 hover:text-[#116AEF]"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => removeModule(m.id)} className="text-slate-400 hover:text-[#FF4444]"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {isOpen && (
                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <ResourceColumn
                      icon={<Video className="w-4 h-4" />}
                      label="Videos"
                      accept="video/*"
                      items={videos}
                      moduleId={m.id}
                      kind="video"
                      titleValue={addTitle[`${m.id}-video`] || ''}
                      onTitleChange={(v) => setAddTitle((p) => ({ ...p, [`${m.id}-video`]: v }))}
                      busy={!!addBusy[`${m.id}-video`]}
                      err={addErr[`${m.id}-video`]}
                      onUpload={(file) => addResource(m.id, 'video', file)}
                      onRemove={removeResource}
                    />
                    <ResourceColumn
                      icon={<FileText className="w-4 h-4" />}
                      label="Digital Files"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      items={files}
                      moduleId={m.id}
                      kind="file"
                      titleValue={addTitle[`${m.id}-file`] || ''}
                      onTitleChange={(v) => setAddTitle((p) => ({ ...p, [`${m.id}-file`]: v }))}
                      busy={!!addBusy[`${m.id}-file`]}
                      err={addErr[`${m.id}-file`]}
                      onUpload={(file) => addResource(m.id, 'file', file)}
                      onRemove={removeResource}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={moduleModalOpen} onClose={() => setModuleModalOpen(false)} title={moduleForm.id ? 'Edit Module' : 'New Module'}>
        <Field label="Module Name *"><input className={inputCls} value={moduleForm.name} onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })} placeholder="e.g. Compliance Dashboard" /></Field>
        <Field label="Description"><textarea className={inputCls} rows={2} value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} /></Field>
        {moduleErr && <p className="text-xs text-[#FF4444] mb-3">{moduleErr}</p>}
        <div className="flex gap-3"><Btn onClick={saveModule} className="flex-1 justify-center">{moduleBusy && <Loader2 className="w-4 h-4 animate-spin" />} Save</Btn><Btn variant="ghost" onClick={() => setModuleModalOpen(false)} className="flex-1 justify-center">Cancel</Btn></div>
      </Modal>
    </div>
  );
};

const ResourceColumn: React.FC<{
  icon: React.ReactNode; label: string; accept: string; items: ResourceRow[]; moduleId: string; kind: 'video' | 'file';
  titleValue: string; onTitleChange: (v: string) => void; busy: boolean; err?: string;
  onUpload: (file: File | null) => void; onRemove: (r: ResourceRow) => void;
}> = ({ icon, label, accept, items, moduleId, kind, titleValue, onTitleChange, busy, err, onUpload, onRemove }) => {
  const [file, setFile] = useState<File | null>(null);
  const inputId = React.useId();
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">{icon} {label}</div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 mb-4">None yet.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {items.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 bg-[#F4F5FB] rounded-lg px-3 py-2">
              <a href={r.url} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-[#0F172A] hover:text-[#116AEF] truncate">{r.title}</a>
              <button onClick={() => onRemove(r)} className="text-slate-400 hover:text-[#FF4444] shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="border border-dashed border-slate-200 rounded-xl p-3 space-y-2">
        <input className={inputCls} placeholder={`Name this ${kind === 'video' ? 'video' : 'file'}…`} value={titleValue} onChange={(e) => onTitleChange(e.target.value)} />
        <label htmlFor={inputId} className="flex items-center gap-2 text-[13px] text-slate-500 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:border-[#116AEF] hover:text-[#116AEF] transition">
          <Upload className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{file ? file.name : `Choose ${kind === 'video' ? 'a video file' : 'a file'} to upload…`}</span>
        </label>
        <input id={inputId} type="file" accept={accept} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {err && <p className="text-xs text-[#FF4444]">{err}</p>}
        <Btn onClick={() => onUpload(file)} className="w-full justify-center text-[12.5px] py-2">{busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Upload {kind === 'video' ? 'Video' : 'File'}</Btn>
      </div>
    </div>
  );
};

export default LearningCenterAdmin;
