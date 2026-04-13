'use client';

import { useEffect, useState, useCallback } from 'react';
import { productoApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';

interface Producto {
  idProducto: string;
  id?: string;
  nombre: string;
  tipo: string;
  codigo: string;
  precioVenta: number;
  marca?: string;
  activo: boolean;
}

const emptyForm = {
  nombre: '',
  tipo: '',
  codigo: '',
  precioVenta: 0,
  marca: '',
  activo: true,
};

export default function ProductosPage() {
  const { toast } = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getProductoId = (producto: Producto) => producto.idProducto || producto.id || '';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productoApi.getAll();
      setProductos(
        data.map((item: any) => ({
          ...item,
          idProducto: item.idProducto || item.id || '',
        })),
      );
    } catch (err: any) {
      toast(err.message || 'Error cargando productos', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  // Filter logic
  const filtered = productos.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.marca?.toLowerCase().includes(search.toLowerCase());
    const matchActive =
      filterActive === 'all' || (filterActive === 'active' ? p.activo : !p.activo);
    return matchSearch && matchActive;
  });

  // Validate form
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre es requerido';
    if (!form.tipo.trim()) e.tipo = 'Tipo es requerido';
    if (!form.codigo.trim()) e.codigo = 'Código es requerido';
    if (form.precioVenta <= 0) e.precioVenta = 'Precio debe ser mayor a 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Open create modal
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  // Open edit modal
  const openEdit = (p: Producto) => {
    const id = getProductoId(p);
    if (!id) {
      toast('No se puede editar: producto sin identificador', 'error');
      return;
    }
    setEditingId(id);
    setForm({
      nombre: p.nombre,
      tipo: p.tipo,
      codigo: p.codigo,
      precioVenta: p.precioVenta,
      marca: p.marca || '',
      activo: p.activo,
    });
    setErrors({});
    setModalOpen(true);
  };

  // Open detail modal
  const openDetail = async (p: Producto) => {
    const id = getProductoId(p);
    if (!id) {
      toast('No se puede ver detalle: producto sin identificador', 'error');
      return;
    }
    try {
      const full = await productoApi.getOne(id);
      setSelectedProducto(full);
      setDetailOpen(true);
    } catch {
      toast('Error cargando detalle', 'error');
    }
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        await productoApi.update(editingId, form);
      } else {
        await productoApi.create(form);
        toast('Producto creado correctamente');
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast(err.message || 'Error guardando producto', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!id) {
      toast('No se puede eliminar: identificador invalido', 'error');
      return;
    }
    try {
      await productoApi.delete(id);
      setProductos((prev) => prev.filter((p) => getProductoId(p) !== id));
      toast('Producto eliminado');
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      toast(err.message || 'Error eliminando producto', 'error');
    }
  };

  // Toggle active
  const handleToggle = async (p: Producto) => {
    const id = getProductoId(p);
    if (!id) {
      toast('No se puede cambiar estado: producto sin identificador', 'error');
      return;
    }
    try {
      await productoApi.toggleActive(id);
      toast(`Producto ${p.activo ? 'desactivado' : 'activado'}`);
      await loadData();
    } catch {
      toast('Error cambiando estado', 'error');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Productos"
        subtitle={`${filtered.length} producto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
        action={
          <button className="btn-primary" onClick={openCreate}>
            Nuevo Producto
          </button>
        }
      />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              className="form-input"
              placeholder="Buscar por nombre, código o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button
                key={f}
                className={`btn-sm ${filterActive === f ? 'bg-brand-600 text-white' : 'btn-ghost'} rounded-lg`}
                onClick={() => setFilterActive(f)}
              >
                {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="inline-block w-8 h-8 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
            <p className="mt-3 text-sm">Cargando productos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-surface-600">
            <p className="font-medium">No hay productos</p>
            <p className="text-sm mt-1">agrega un producto primero ñame</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Marca</th>
                  <th className="text-right">Precio</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={getProductoId(p) || p.codigo}>
                    <td>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{p.codigo}</code>
                    </td>
                    <td>
                      <button className="font-semibold text-brand-700 hover:text-brand-900 hover:underline text-left" onClick={() => openDetail(p)}>
                        {p.nombre}
                      </button>
                    </td>
                    <td className="text-gray-600">{p.tipo}</td>
                    <td className="text-gray-600">{p.marca || '—'}</td>
                    <td className="text-right font-semibold text-surface-800 font-mono">
                      RD${p.precioVenta.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <button onClick={() => handleToggle(p)} className="cursor-pointer">
                        <span className={`badge ${p.activo ? 'badge-green' : 'badge-red'}`}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn-secondary btn-sm" onClick={() => openDetail(p)} title="Ver detalle">Ver</button>
                        <button className="btn-edit btn-sm" onClick={() => openEdit(p)} title="Editar">Editar</button>
                        <button className="btn-delete btn-sm" onClick={() => setDeleteConfirm(getProductoId(p))} title="Eliminar">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Nombre *</label>
            <input className={`form-input ${errors.nombre ? 'border-red-400 ring-1 ring-red-200' : ''}`} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Profe ponganos 100" />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
          </div>
          <div>
            <label className="form-label">Código *</label>
            <input className={`form-input ${errors.codigo ? 'border-red-400 ring-1 ring-red-200' : ''}`} value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} placeholder="El mejor trabajo" />
            {errors.codigo && <p className="text-xs text-red-500 mt-1">{errors.codigo}</p>}
          </div>
          <div>
            <label className="form-label">Tipo *</label>
            <input className={`form-input ${errors.tipo ? 'border-red-400 ring-1 ring-red-200' : ''}`} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="William charlatan" />
            {errors.tipo && <p className="text-xs text-red-500 mt-1">{errors.tipo}</p>}
          </div>
          <div>
            <label className="form-label">Precio de Venta (RD$) *</label>
            <input type="number" step="0.01" min="0" className={`form-input ${errors.precioVenta ? 'border-red-400 ring-1 ring-red-200' : ''}`} value={form.precioVenta || ''} onChange={(e) => setForm({ ...form, precioVenta: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
            {errors.precioVenta && <p className="text-xs text-red-500 mt-1">{errors.precioVenta}</p>}
          </div>
          <div>
            <label className="form-label">Marca</label>
            <input className="form-input" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Ferrari" />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
              <div className="w-9 h-5 bg-surface-300 peer-focus:outline-none rounded-full peer peer-checked:bg-brand-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-surface-0 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
            <span className="text-sm font-medium text-surface-800">Producto activo</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
            ) : (
              editingId ? 'Guardar Cambios' : 'Crear Producto'
            )}
          </button>
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle del Producto" size="lg">
        {selectedProducto && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-surface-900">{selectedProducto.nombre}</h3>
                <code className="text-sm bg-surface-100 px-2.5 py-1 rounded font-mono text-surface-700 mt-1 inline-block">{selectedProducto.codigo}</code>
              </div>
              <span className={`badge ${selectedProducto.activo ? 'badge-green' : 'badge-red'} text-sm`}>
                {selectedProducto.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-100 rounded-xl p-4">
                <p className="text-xs text-surface-600 font-medium mb-1">Tipo</p>
                <p className="font-semibold text-surface-800">{selectedProducto.tipo}</p>
              </div>
              <div className="bg-surface-100 rounded-xl p-4">
                <p className="text-xs text-surface-600 font-medium mb-1">Marca</p>
                <p className="font-semibold text-surface-800">{selectedProducto.marca || '—'}</p>
              </div>
              <div className="bg-brand-50 rounded-xl p-4 ring-1 ring-brand-200">
                <p className="text-xs text-brand-600 font-medium mb-1">Precio de Venta</p>
                <p className="font-bold text-brand-800 text-lg font-mono">RD${selectedProducto.precioVenta.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
              <button className="btn-secondary" onClick={() => { setDetailOpen(false); openEdit(selectedProducto); }}>
                Editar
              </button>
              <button className="btn-ghost" onClick={() => setDetailOpen(false)}>Cerrar</button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Eliminación" size="sm">
        <div className="text-center">
          <p className="text-surface-800 font-medium mb-1">¿Estás seguro de eliminar este producto?</p>
          <p className="text-sm text-surface-600 mb-5">Esta acción no se puede deshacer.</p>
          <div className="flex gap-3 justify-center">
            <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
            <button className="btn-delete" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Eliminar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
