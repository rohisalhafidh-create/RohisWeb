import React, { useEffect, useState, useRef } from 'react';
import * as animeImport from 'animejs';
const anime = (animeImport as any).default || animeImport;
import { useApi } from '../hooks/useApi';
import { Activity, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { fetchApi } = useApi();
  const [stats, setStats] = useState({ totalActivities: 0, totalAchievements: 0, totalMembers: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  const heroRef = useRef<HTMLDivElement>(null);
  const aboutLeftRef = useRef<HTMLDivElement>(null);
  const aboutRightRef = useRef<HTMLDivElement>(null);
  const recruitmentRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, actData, achData, setData] = await Promise.all([
          fetchApi('/stats'),
          fetchApi('/activities'),
          fetchApi('/achievements'),
          fetchApi('/settings')
        ]);
        setStats(statsData);
        setActivities(actData.slice(0, 3));
        setSettings(setData || {});
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    };
    loadData();
  }, [fetchApi]);

  useEffect(() => {
    // Initial setup (hide elements before animating)
    if (aboutLeftRef.current) aboutLeftRef.current.style.opacity = '0';
    if (recruitmentRef.current) recruitmentRef.current.style.opacity = '0';
    if (posterRef.current) posterRef.current.style.opacity = '0';

    const actCards = document.querySelectorAll('.activity-card');
    actCards.forEach(card => (card as HTMLElement).style.opacity = '0');
    const statCards = document.querySelectorAll('.about-stat-card');
    statCards.forEach(card => (card as HTMLElement).style.opacity = '0');

    // Hero Stagger Animation
    anime({
      targets: '.hero-anim-item',
      opacity: [0, 1],
      translateY: [30, 0],
      delay: anime.stagger(150),
      duration: 1200,
      easing: 'easeOutElastic(1, .8)'
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === aboutLeftRef.current) {
            anime({
              targets: aboutLeftRef.current,
              opacity: [0, 1],
              translateX: [-40, 0],
              duration: 800,
              easing: 'easeOutCubic'
            });
          }
          if (entry.target === aboutRightRef.current) {
            anime({
              targets: '.about-stat-card',
              opacity: [0, 1],
              scale: [0.8, 1],
              delay: anime.stagger(150),
              duration: 800,
              easing: 'easeOutBack'
            });
          }
          if (entry.target === recruitmentRef.current) {
             anime({
              targets: recruitmentRef.current,
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 800,
              easing: 'easeOutQuart'
            });
          }
          if (entry.target === posterRef.current) {
            anime({
              targets: posterRef.current,
              rotate: [10, 0],
              opacity: [0, 1],
              scale: [0.8, 1],
              duration: 1200,
              easing: 'easeOutElastic(1, .8)',
              complete: () => {
                // Floating animation after initial pop-in
                anime({
                  targets: posterRef.current,
                  translateY: [-8, 8],
                  direction: 'alternate',
                  loop: true,
                  easing: 'easeInOutSine',
                  duration: 2500
                });
              }
            });
          }
          if (entry.target === activitiesRef.current) {
            anime({
              targets: '.activity-card',
              opacity: [0, 1],
              translateY: [40, 0],
              delay: anime.stagger(150),
              duration: 800,
              easing: 'easeOutQuart'
            });
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const refs = [aboutLeftRef, aboutRightRef, recruitmentRef, posterRef, activitiesRef];
    refs.forEach(r => r.current && observer.observe(r.current));

    return () => observer.disconnect();
  }, [activities]); // trigger on load and when fetched

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 lg:mx-8 mt-6" ref={heroRef}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-green-500/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-emerald-500/20 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative px-8 py-20 lg:py-24 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="hero-anim-item w-20 h-20 bg-white backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-xl mb-8 mx-auto overflow-hidden p-2 opacity-0">
            <img src="/logo.png" alt="Logo Rohis" className="w-full h-full object-contain drop-shadow-md" onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=RA&background=ecfdf5&color=059669" }} />
          </div>
          <h1 className="hero-anim-item text-4xl lg:text-6xl font-bold mb-4 tracking-tight opacity-0">
            ROHIS AL HAFIDH
          </h1>
          <h2 className="hero-anim-item text-2xl lg:text-3xl text-green-400 font-medium mb-8 opacity-0">
            {settings?.schoolName || 'SMKN 1 SEMARANG'}
          </h2>
          <p className="hero-anim-item text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed opacity-0">
            "{settings?.tagline || 'Semangat Berdakwah, Menjalani Ukhuwah'}"
          </p>
          <a
            href="https://www.instagram.com/rohisalhafidh?igsi=NG9oanVmN3M5NHM5"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-anim-item mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#405DE6] via-[#C13584] to-[#F56040] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition-transform duration-200 hover:scale-[1.02] opacity-0"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current text-white drop-shadow-sm">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
            </svg>
            <span>@rohisalhafidh</span>
          </a>
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 lg:px-8 mt-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div ref={aboutLeftRef}>
            <h3 className="text-sm font-bold text-green-600 tracking-wider uppercase mb-3">Apa Itu Rohis?</h3>
            <h2 className="text-3xl font-bold text-slate-800 mb-6 leading-tight">Tentang Rohis Al Hafidh</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              {settings?.description || 'Rohis Al Hafidh merupakan organisasi kerohanian Islam di SMKN 1 Semarang yang menjadi wadah bagi siswa untuk memperdalam ilmu agama, membangun akhlak, mempererat ukhuwah Islamiyah, serta berkontribusi dalam berbagai kegiatan positif di lingkungan sekolah.'}
            </p>
          </div>

          <div ref={aboutRightRef} className="grid grid-cols-2 gap-4">
            <div className="about-stat-card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <Activity size={24} />
              </div>
              <span className="text-3xl font-bold text-slate-800 mb-1">{stats.totalActivities}</span>
              <span className="text-sm text-slate-500 font-medium">Kegiatan</span>
            </div>
            <div className="about-stat-card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Award size={24} />
              </div>
              <span className="text-3xl font-bold text-slate-800 mb-1">{stats.totalAchievements}</span>
              <span className="text-sm text-slate-500 font-medium">Prestasi</span>
            </div>
            <div className="about-stat-card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center col-span-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <span className="text-3xl font-bold text-slate-800 mb-1">{stats.totalMembers}</span>
              <span className="text-sm text-slate-500 font-medium">Pengurus & Anggota</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Section */}
      <section className="px-4 lg:px-8 mt-24 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-blue-800/50">
          <div className="grid md:grid-cols-2 items-center">
            <div ref={recruitmentRef} className="p-8 lg:p-12 text-white">
              <div className="inline-block bg-blue-500/20 text-blue-300 font-bold px-3 py-1 rounded-full text-sm mb-6 border border-blue-500/30">
                Pendaftaran Dibuka
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Open Rekrutmen <span className="text-blue-400">Rohis Al Hafidh</span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Mari bergabung bersama kami menjadi bagian dari keluarga besar Rohis Al Hafidh SMKN 1 Semarang periode 2026/2027. Jadikan masa mudamu lebih bermanfaat dan penuh berkah.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <span className="text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Syarat & Ketentuan</h4>
                    <p className="text-sm text-slate-400">Beragama Islam, Disiplin, Tanggung jawab, Sehat jasmani dan rohani, Siap berkontribusi.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <span className="text-sm text-xs">📅</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Periode Pendaftaran</h4>
                    <p className="text-sm text-slate-400">1 Oktober - 10 November 2026</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdI6wjUMi3tLhjt0tb63nsd0bcLyWXSIilyaNp-XjYlvix7bQ/viewform?usp=header"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition-colors text-center shadow-lg shadow-blue-500/30 inline-block w-max relative overflow-hidden group"
                  onMouseEnter={(e) => {
                    anime({
                      targets: e.currentTarget,
                      scale: 1.05,
                      duration: 300,
                      easing: 'easeOutQuad'
                    });
                  }}
                  onMouseLeave={(e) => {
                    anime({
                      targets: e.currentTarget,
                      scale: 1,
                      duration: 300,
                      easing: 'easeOutQuad'
                    });
                  }}
                >
                  Daftar Sekarang
                </a>
              </div>
            </div>
            
            <div className="relative h-full min-h-[400px] bg-blue-950/50 flex items-center justify-center p-8 lg:p-12 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 z-0"></div>
              
              <div 
                ref={posterRef}
                className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-slate-800"
              >
                <img 
                  src="/image.png" 
                  alt="Poster Open Rekrutmen Rohis" 
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="px-4 lg:px-8 mt-24 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-sm font-bold text-green-600 tracking-wider uppercase mb-2">Dokumentasi</h3>
            <h2 className="text-3xl font-bold text-slate-800">Kegiatan Terbaru</h2>
          </div>
          <Link to="/gallery" className="text-green-600 font-medium hover:text-green-700 transition-colors">
            Lihat Semua →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6" ref={activitiesRef}>
          {activities.length > 0 ? activities.map((activity, i) => (
            <div
              key={activity.id}
              className="activity-card bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group cursor-pointer hover:shadow-md transition-shadow"
              onMouseEnter={(e) => {
                anime({
                  targets: e.currentTarget,
                  translateY: -5,
                  duration: 300,
                  easing: 'easeOutQuad'
                });
              }}
              onMouseLeave={(e) => {
                anime({
                  targets: e.currentTarget,
                  translateY: 0,
                  duration: 300,
                  easing: 'easeOutQuad'
                });
              }}
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {activity.coverImage ? (
                  <img src={activity.coverImage} alt={activity.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Activity size={32} />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-700">
                  {activity.category}
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500 mb-2 font-medium">
                  {new Date(activity.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1">{activity.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                  {activity.description}
                </p>
                <Link to={`/gallery`} className="text-sm font-bold text-green-600 group-hover:text-green-700">
                  Lihat Detail →
                </Link>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Belum ada data kegiatan.
            </div>
          )}
        </div>
      </section>

      {/* Preview Structure */}
      <section className="px-4 lg:px-8 mt-24 mb-12 max-w-6xl mx-auto text-center">
        <div className="bg-slate-900 rounded-3xl p-12 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent group-hover:opacity-20 transition-opacity duration-500" />
          <div className="relative z-10">
            <Users size={48} className="mx-auto text-green-400 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Struktur Kepengurusan</h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8">
              Kenali lebih dekat susunan pengurus dan anggota Rohis Al Hafidh periode saat ini.
            </p>
            <Link 
              to="/organization" 
              className="inline-block bg-white text-slate-900 font-bold px-8 py-3.5 rounded-full hover:bg-green-50 transition-colors shadow-lg"
              onMouseEnter={(e) => {
                anime({
                  targets: e.target,
                  scale: 1.05,
                  duration: 200,
                  easing: 'easeOutQuad'
                });
              }}
              onMouseLeave={(e) => {
                anime({
                  targets: e.target,
                  scale: 1,
                  duration: 200,
                  easing: 'easeOutQuad'
                });
              }}
            >
              Lihat Struktur Lengkap
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
