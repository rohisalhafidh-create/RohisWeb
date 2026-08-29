import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { Award, Trophy } from 'lucide-react';

export default function Achievements() {
  const { fetchApi } = useApi();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const data = await fetchApi('/achievements');
        setAchievements(data);
      } catch (e) {
        console.error('Failed to load achievements', e);
      } finally {
        setLoading(false);
      }
    };
    loadAchievements();
  }, [fetchApi]);

  // Group by year
  const grouped = achievements.reduce((acc, curr) => {
    const year = curr.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(curr);
    return acc;
  }, {} as Record<number, any[]>);

  const years = Object.keys(grouped).map(Number).sort((a, b) => b - a);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Trophy size={32} />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">Prestasi Kami</h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Daftar pencapaian dan penghargaan yang diraih oleh organisasi dan anggota Rohis Al Hafidh.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : years.length > 0 ? (
        <div className="space-y-16">
          {years.map(year => (
            <div key={year}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold text-slate-800">{year}</h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              
              <div className="grid gap-6">
                {grouped[year].map((ach, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    key={ach.id}
                    className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 sm:gap-6 items-start"
                  >
                    {ach.imageUrl ? (
                      <div className="w-full md:w-auto max-w-full shrink-0 overflow-hidden rounded-xl bg-slate-50 self-stretch md:self-auto">
                        <img src={ach.imageUrl} alt={ach.title} className="block w-full md:w-[220px] h-auto md:h-[180px] object-cover rounded-xl bg-slate-50" />
                      </div>
                    ) : (
                      <div className="w-full md:w-[220px] h-[180px] bg-amber-50 rounded-xl flex items-center justify-center text-amber-300">
                        <Award size={48} />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                          Tingkat {ach.level}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{ach.title}</h3>
                      <p className="text-green-600 font-medium text-sm mb-3">{ach.event}</p>
                      <p className="text-slate-600 text-sm mb-4">{ach.description}</p>
                      <div className="inline-flex items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-sm text-slate-700">
                        <span className="text-slate-400 mr-2">Penerima:</span>
                        <span className="font-semibold">{ach.winner}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500">Belum ada data prestasi.</p>
        </div>
      )}
    </div>
  );
}
