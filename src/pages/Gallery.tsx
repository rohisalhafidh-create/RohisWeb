import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Gallery() {
  const { fetchApi } = useApi();
  const [activities, setActivities] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [fetchApi]);

  const loadActivities = async () => {
    try {
      const data = await fetchApi('/activities');
      setActivities(data);
      const uniqueCats = Array.from(new Set(data.map((a: any) => a.category))) as string[];
      setCategories(['Semua', ...uniqueCats]);
    } catch (e) {
      console.error('Failed to fetch activities', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (activity: any) => {
    setSelectedActivity({ ...activity, images: null }); // loading state for images
    try {
      const detail = await fetchApi(`/activities/${activity.id}`);
      setSelectedActivity(detail);
    } catch (e) {
      console.error('Failed to load detail', e);
      setSelectedActivity((prev: any) => (prev ? { ...prev, images: [] } : null));
    }
  };

  const filteredActivities = activeCategory === 'Semua' 
    ? activities 
    : activities.filter(a => a.category === activeCategory);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2 sm:mb-4">Galeri Kegiatan</h1>
        <p className="text-slate-600 max-w-2xl text-sm sm:text-lg">
          Dokumentasi perjalanan dan kegiatan positif yang telah diselenggarakan oleh Rohis Al Hafidh.
        </p>
      </div>

      {/* Category Filter */}
      {!loading && categories.length > 1 && (
        <div className="flex gap-2 mb-5 sm:mb-8 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Masonry-like Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-100 rounded-2xl aspect-[4/3] animate-pulse" />
          ))}
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredActivities.map((activity, idx) => (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx, 8) * 0.035, duration: 0.22 }}
              key={activity.id}
              onClick={() => handleOpenDetail(activity)}
              className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer group hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-slate-100">
                {activity.coverImage ? (
                  <img 
                    src={activity.coverImage} 
                    alt={activity.title} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                    <span className="text-sm">Tidak ada cover</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 max-w-[calc(100%-1rem)] truncate bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-green-700 shadow-sm">
                  {activity.category}
                </div>
              </div>
              
              <div className="p-2.5 sm:p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-500 mb-1 sm:mb-2">
                  <Calendar size={12} className="shrink-0 sm:hidden" />
                  <Calendar size={14} className="hidden shrink-0 sm:block" />
                  <span className="truncate">{new Date(activity.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-lg leading-snug line-clamp-2 sm:mb-2">{activity.title}</h3>
                <p className="hidden sm:block text-slate-600 text-sm line-clamp-2 mt-auto">{activity.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500">Belum ada kegiatan yang sesuai.</p>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-start p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedActivity.title}</h2>
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(selectedActivity.date).toLocaleDateString('id-ID')}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">{selectedActivity.category}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <p className="text-slate-700 leading-relaxed mb-8">{selectedActivity.description}</p>
                
                {selectedActivity.images && selectedActivity.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedActivity.images.map((img: any) => (
                      <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img src={img.imageUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : selectedActivity.images ? (
                   <p className="text-center text-slate-400 py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">Tidak ada foto tambahan</p>
                ) : (
                   <div className="flex justify-center p-10"><span className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
