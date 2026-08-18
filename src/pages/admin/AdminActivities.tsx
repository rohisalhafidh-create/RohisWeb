import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Plus, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../../components/ConfirmDialog';
import { fileToBase64 } from '../../lib/utils';

export default function AdminActivities() {
  const { fetchApi } = useApi();
  const [activities, setActivities] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    coverImage: ''
  });

  useEffect(() => {
    loadActivities();
  }, [fetchApi]);

  const loadActivities = async () => {
    try {
      const data = await fetchApi('/activities');
      setActivities(data);
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      date: new Date().toISOString().slice(0, 10),
      description: '',
      coverImage: ''
    });
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (activity: any) => {
    setFormData({
      title: activity.title,
      category: activity.category,
      date: new Date(activity.date).toISOString().slice(0, 10),
      description: activity.description,
      coverImage: activity.coverImage || ''
    });
    setEditingId(activity.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id: editingId || `act_${Date.now()}`,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      };
      
      if (editingId) {
        await fetchApi(`/activities/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi('/activities', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      loadActivities();
    } catch (error) {
      console.error("Failed to save", error); alert(error.message || error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetchApi(`/activities/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      loadActivities();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Kegiatan</h1>
          <p className="text-slate-500 text-sm">Tambah, ubah, atau hapus kegiatan & galeri.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Plus size={16} /> Tambah Kegiatan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="p-4 font-medium">Kegiatan</th>
              <th className="p-4 font-medium">Kategori</th>
              <th className="p-4 font-medium">Tanggal</th>
              <th className="p-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.map(act => (
              <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {act.coverImage ? (
                      <img src={act.coverImage} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <ImageIcon size={16} />
                      </div>
                    )}
                    <span className="font-medium text-slate-800">{act.title}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">{act.category}</span>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {new Date(act.date).toLocaleDateString('id-ID')}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenEdit(act)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeleteId(act.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">Belum ada data kegiatan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-slate-800">{editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Judul Kegiatan</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Sosial" className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image (Opsional)</label>
                  <div className="flex items-center gap-4">
                    {formData.coverImage && (
                      <img src={formData.coverImage} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const base64 = await fileToBase64(file);
                            setFormData({...formData, coverImage: base64});
                          } catch (err) {
                            console.error("Gagal membaca file", err);
                          }
                        }
                      }} 
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                  <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none resize-none" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Kegiatan"
        message="Yakin ingin menghapus kegiatan ini? Data yang dihapus tidak dapat dikembalikan."
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
