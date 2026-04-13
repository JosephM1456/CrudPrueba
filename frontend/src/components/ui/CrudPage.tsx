'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';

interface Column {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
}

interface Field {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'email' | 'tel';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  colSpan?: number;
}

interface CrudPageProps {
  title: string;
  data: any[];
  columns: Column[];
  fields: Field[];
  loading: boolean;
  onSave: (data: any, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  idKey: string;
  searchKeys?: string[];
}

export default function CrudPage({ title, data, columns, fields, loading, onSave, onDelete, idKey, searchKeys = [] }: CrudPageProps) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const filtered = data.filter((item) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return searchKeys.some((k) => (item[k] || '').toString().toLowerCase().includes(s));
  });

  const openCreate = () => {
    setEditingId(null);
    const empty: Record<string, any> = {};
    fields.forEach((f) => (empty[f.key] = f.type === 'number' ? 0 : ''));
    setForm(empty);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item[idKey]);
    const values: Record<string, any> = {};
    fields.forEach((f) => (values[f.key] = item[f.key] ?? (f.type === 'number' ? 0 : '')));
    setForm(values);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form, editingId || undefined);
      setModalOpen(false);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title={title}
        subtitle={`${filtered.length} registro${filtered.length !== 1 ? 's' : ''}`}
        action={<button className="btn-primary" onClick={openCreate}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Nuevo</button>}
      />

      {searchKeys.length > 0 && (
        <div className="card p-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input className="form-input pl-10" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="inline-block w-8 h-8 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
            <p className="mt-3 text-sm">Cargando...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="font-medium">Sin registros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th className="text-right">Acciones</th></tr></thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item[idKey]}>
                    {columns.map((c) => (
                      <td key={c.key}>{c.render ? c.render(item) : item[c.key] || '—'}</td>
                    ))}
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn-edit btn-sm" onClick={() => openEdit(item)} title="Editar">Editar</button>
                        <button className="btn-delete btn-sm" onClick={() => setDeleteConfirm(item[idKey])} title="Eliminar">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? `Editar` : `Nuevo registro`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={f.colSpan === 2 ? 'md:col-span-2' : ''}>
              <label className="form-label">{f.label}{f.required ? ' *' : ''}</label>
              {f.type === 'select' ? (
                <select className="form-select" value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                  <option value="">— Seleccionar —</option>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  type={f.type || 'text'}
                  className="form-input"
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                  placeholder={f.placeholder}
                  step={f.type === 'number' ? '0.01' : undefined}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : editingId ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Eliminación" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          </div>
          <p className="text-surface-800 font-medium mb-1">¿Eliminar este registro?</p>
          <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
          <div className="flex gap-3 justify-center">
            <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
            <button className="btn-danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Eliminar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
