import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Activity, Award, Users, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard() {
  const { fetchApi } = useApi();
  const [stats, setStats] = useState({ totalActivities: 0, totalAchievements: 0, totalMembers: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchApi('/stats');
        setStats(data);
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    };
    loadStats();
  }, [fetchApi]);

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-8">Ringkasan statistik website Rohis Al Hafidh.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Kegiatan" value={stats.totalActivities} icon={Activity} colorClass="bg-green-50 text-green-600" />
        <StatCard title="Total Prestasi" value={stats.totalAchievements} icon={Award} colorClass="bg-amber-50 text-amber-600" />
        <StatCard title="Total Pengurus" value={stats.totalMembers} icon={Users} colorClass="bg-blue-50 text-blue-600" />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Selamat Datang di Panel Admin</h2>
        <p className="text-slate-600 max-w-2xl leading-relaxed">
          Gunakan menu di sebelah kiri untuk mengelola konten website. Anda dapat menambah, mengedit, dan menghapus kegiatan, foto galeri, daftar prestasi, serta memperbarui struktur organisasi secara realtime.
        </p>
      </div>
    </div>
  );
}
