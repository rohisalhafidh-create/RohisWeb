import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Plus, Edit2, Trash2, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../../components/ConfirmDialog';
import { fileToBase64 } from '../../lib/utils';

export default function AdminAchievements() {
  const { fetchApi } = useApi();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    event: '',
    level: 'Kota',
    year: new Date().getFullYear(),
    winner: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    loadData();
  }, [fetchApi]);

  const loadData = async () => {
    try {
      const data = await fetchApi('/achievements');
      setAchievements(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      title: '', event: '', level: 'Kota', year: new Date().getFullYear(), winner: '', description: '', imageUrl: ''
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ach: any) => {
    setFormData({
      title: ach.title, event: ach.event, level: ach.level, year: ach.year, winner: ach.winner, description: ach.description, imageUrl: ach.imageUrl || ''
    });
    setEditingId(ach.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, id: editingId || `ach_${Date.now()}` };
      
      if (editingId) {
        await fetchApi(`/achievements/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/achievements', { method: 'POST', body: JSON.stringify(payload) });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Gagal menyimpan data", error); alert(error.message || error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetchApi(`/achievements/${deleteId}`, { method: 'DELETE' });
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
          <h1 className="text-2xl font-bold text-slate-800">Kelola Prestasi</h1>
          <p className="text-slate-500 text-sm">Catat penghargaan yang diraih.</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-green-700 transition-colors">
          <Plus size={16} /> Tambah Prestasi
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="p-4 font-medium">Prestasi</th>
              <th className="p-4 font-medium">Penerima</th>
              <th className="p-4 font-medium">Tahun</th>
              <th className="p-4 font-medium">Tingkat</th>
              <th className="p-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {achievements.map(ach => (
              <tr key={ach.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{ach.title} <br/><span className="text-xs text-slate-500 font-normal">{ach.event}</span></td>
                <td className="p-4 text-sm text-slate-600">{ach.winner}</td>
                <td className="p-4 text-sm text-slate-600">{ach.year}</td>
                <td className="p-4 text-sm"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">{ach.level}</span></td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenEdit(ach)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => setDeleteId(ach.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal form omitted for brevity, similar structure to AdminActivities */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-slate-800">{editingId ? 'Edit Prestasi' : 'Tambah Prestasi'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Judul Prestasi</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-xl px-4 py-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Nama Lomba/Event</label>
                  <input required type="text" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Tingkat</label>
                    <input required type="text" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Tahun</label>
                    <input required type="number" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full border rounded-xl px-4 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Penerima</label>
                  <input required type="text" value={formData.winner} onChange={e => setFormData({...formData, winner: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Foto Prestasi (Opsional)</label>
                  <div className="flex items-center gap-4">
                    {formData.imageUrl && (
                      <img src={formData.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const base64 = await fileToBase64(file);
                            setFormData({...formData, imageUrl: base64});
                          } catch (err) {
                            console.error("Gagal membaca file", err);
                          }
                        }
                      }} 
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Deskripsi Singkat</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-xl px-4 py-2 resize-none" rows={3}/>
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
        title="Hapus Prestasi"
        message="Yakin ingin menghapus prestasi ini? Data yang dihapus tidak dapat dikembalikan."
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
