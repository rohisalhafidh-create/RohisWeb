import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Plus, Edit2, Trash2, X, MoveUp, MoveDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../../components/ConfirmDialog';
import { fileToBase64 } from '../../lib/utils';

export default function AdminOrganization() {
  const { fetchApi } = useApi();
  const [members, setMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    category: 'Pengurus Inti',
    gender: 'Laki-laki',
    description: '',
    photoUrl: '',
    sortOrder: 0
  });

  const CATEGORIES = ['Pembina Putra', 'Pembina Putri', 'Pengurus Inti', 'Anggota Putra', 'Anggota Putri'];

  useEffect(() => {
    loadData();
  }, [fetchApi]);

  const loadData = async () => {
    try {
      const data = await fetchApi('/organization');
      setMembers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '', position: '', category: 'Pengurus Inti', gender: 'Laki-laki', description: '', photoUrl: '', sortOrder: members.length
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: any) => {
    setFormData({
      name: m.name, position: m.position, category: m.category, gender: m.gender, description: m.description || '', photoUrl: m.photoUrl || '', sortOrder: m.sortOrder
    });
    setEditingId(m.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, id: editingId || `mem_${Date.now()}` };
      
      if (editingId) {
        await fetchApi(`/organization/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/organization', { method: 'POST', body: JSON.stringify(payload) });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Gagal menyimpan data", error); alert(error.message || String(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetchApi(`/organization/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Struktur Organisasi</h1>
          <p className="text-slate-500 text-sm">Kelola pengurus dan anggota.</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-green-700 transition-colors">
          <Plus size={16} /> Tambah Anggota
        </button>
      </div>

      <div className="space-y-8">
        {CATEGORIES.map(cat => {
          const catMembers = members.filter(m => m.category === cat);
          if (catMembers.length === 0) return null;
          return (
            <div key={cat} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 font-bold text-slate-800">
                {cat}
              </div>
              <ul className="divide-y divide-slate-100">
                {catMembers.map(m => (
                  <li key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                        {m.photoUrl && <img src={m.photoUrl} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.position}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteId(m.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-slate-800">{editingId ? 'Edit Anggota' : 'Tambah Anggota'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Nama Lengkap</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Jabatan</label>
                    <input required type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full border rounded-xl px-4 py-2" placeholder="Ketua, Anggota..." />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Kategori</label>
                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-xl px-4 py-2">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Gender</label>
                    <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border rounded-xl px-4 py-2">
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Urutan Tampil</label>
                    <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})} className="w-full border rounded-xl px-4 py-2" min="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Foto Anggota (Opsional)</label>
                  <div className="flex items-center gap-4">
                    {formData.photoUrl && (
                      <img src={formData.photoUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const base64 = await fileToBase64(file);
                            setFormData({...formData, photoUrl: base64});
                          } catch (err) {
                            console.error("Gagal membaca file", err);
                          }
                        }
                      }} 
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-xl">Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Anggota"
        message="Yakin ingin menghapus anggota ini? Data yang dihapus tidak dapat dikembalikan."
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
