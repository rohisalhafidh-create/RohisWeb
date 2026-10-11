import React, { useEffect, useState, useRef, useCallback } from 'react';
import anime from 'animejs';
import { useApi } from '../hooks/useApi';
import { Activity, Award, Eye, Users, Sparkles, CheckCircle2, Calendar, HeartHandshake, Briefcase, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const BENEFITS = [
  {
    num: "01",
    title: "Peluang Pengurus Kota & Provinsi",
    desc: "Peluang menjadi pengurus Rohis tingkat Kota Semarang. Provinsi Jawa Tengah bahkan hingga Nasional, sesuai kesempatan dan proses seleksi yang berlaku.",
    icon: Award,
    color: "bg-amber-50 text-amber-600 border-amber-200/60",
  },
  {
    num: "02",
    title: "Sertifikat Kepengurusan",
    desc: "Sertifikat kepengurusan sebagai bukti pengalaman berorganisasi, dengan ketentuan penerbitan yang berlaku.",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  },
  {
    num: "03",
    title: "Relasi dan Lingkungan Positif",
    desc: "Memperluas pertemanan dengan siswa lintas kelas, sekolah, hingga komunitas Rohis di Kota Semarang,Jawa Tengah hingga Nasional melalui kegiatan bersama.",
    icon: Users,
    color: "bg-blue-50 text-blue-600 border-blue-200/60",
  },
  {
    num: "04",
    title: "Pengalaman Menyelenggarakan Acara",
    desc: "Berpartisipasi dalam perencanaan kajian, peringatan hari besar Islam, kegiatan sosial, dan berbagai program sekolah yang melatih kemampuan mengelola acara.",
    icon: Calendar,
    color: "bg-purple-50 text-purple-600 border-purple-200/60",
  },
  {
    num: "05",
    title: "Kegiatan & Kolaborasi",
    desc: "Mendapat kesempatan berpartisipasi dalam kegiatan keislaman, pelatihan, seminar, serta kolaborasi antarsekolah.",
    icon: HeartHandshake,
    color: "bg-teal-50 text-teal-600 border-teal-200/60",
  },
  {
    num: "06",
    title: "Portofolio & Pengalaman Organisasi",
    desc: "Memiliki pengalaman nyata dalam menjalankan program kerja, mengelola kegiatan, dan bekerja dalam tim yang dapat menjadi nilai tambah untuk portofolio pribadi maupun persiapan masa depan.",
    icon: Briefcase,
    color: "bg-rose-50 text-rose-600 border-rose-200/60",
  },
  {
    num: "07",
    title: "Bertumbuh Bersama dalam Kebaikan",
    desc: "Memperdalam ilmu agama, mempererat ukhuwah, serta membangun kebiasaan positif bersama lingkungan yang saling mendukung.",
    icon: TrendingUp,
    color: "bg-green-50 text-green-600 border-green-200/60",
  },
];

const ISLAMIC_QUOTES = [
  { text: "Maka sesungguhnya bersama kesulitan ada kemudahan.", source: "QS. Al-Insyirah: 5-6" },
  { text: "Barang siapa menempuh jalan untuk menuntut ilmu, Allah mudahkan baginya jalan menuju surga.", source: "HR. Muslim no. 2699" },
  { text: "Sebaik-baik manusia di antaramu adalah yang paling bermanfaat bagi orang lain.", source: "HR. Ahmad & Ath-Thabrani" },
  { text: "Ingatlah kepada-Ku, niscaya Aku ingat (pula) kepadamu.", source: "QS. Al-Baqarah: 152" },
  { text: "Senyummu di hadapan saudaramu adalah sedekah bagimu.", source: "HR. Tirmidzi no. 1956" },
  { text: "Dan bersabarlah, sesungguhnya janji Allah itu adalah benar.", source: "QS. Ar-Rum: 60" },
  { text: "Kebaikan itu adalah akhlak yang mulia.", source: "HR. Muslim no. 2553" },
  { text: "Barang siapa beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam.", source: "HR. Bukhari & Muslim" },
  { text: "Jadikanlah sabar dan salat sebagai penolongmu.", source: "QS. Al-Baqarah: 45" },
  { text: "Sesungguhnya Allah bersama orang-orang yang sabar.", source: "QS. Al-Baqarah: 153" },
  { text: "Dan Rabbmu sekali-kali tidak pernah lupa.", source: "QS. Maryam: 64" },
  { text: "Sesungguhnya Allah menyukai orang-orang yang berbuat kebaikan.", source: "QS. Ali 'Imran: 134" },
  { text: "Hanya dengan mengingat Allah hati menjadi tenteram.", source: "QS. Ar-Ra'd: 28" },
  { text: "Tidak akan berkurang harta karena sedekah.", source: "HR. Muslim no. 2588" },
  { text: "Tebarkanlah salam, berikanlah makan, dan salatlah malam saat manusia tidur, niscaya kalian masuk surga dengan selamat.", source: "HR. Tirmidzi no. 2485" },
  { text: "Sesungguhnya setiap amalan tergantung pada niatnya.", source: "HR. Bukhari no. 1" },
  { text: "Janganlah engkau marah, maka bagimu surga.", source: "HR. Ath-Thabrani" },
  { text: "Barang siapa bertawakal kepada Allah, niscaya Allah akan mencukupkan keperluannya.", source: "QS. At-Talaq: 3" },
  { text: "Orang mukmin yang paling sempurna imannya adalah yang paling baik akhlaknya.", source: "HR. Abu Dawud no. 4682" },
  { text: "Dan rendahkanlah hatimu terhadap orang-orang yang beriman.", source: "QS. Al-Hijr: 88" },
  { text: "Dunia ini perhiasan, dan sebaik-baik perhiasan dunia adalah wanita salehah.", source: "HR. Muslim no. 1467" },
  { text: "Sampaikanlah dariku walau hanya satu ayat.", source: "HR. Bukhari no. 3461" },
  { text: "Sesungguhnya Allah Maha Indah dan mencintai keindahan.", source: "HR. Muslim no. 91" },
  { text: "Cukuplah Allah menjadi Penolong kami dan Dia adalah sebaik-baik Pelindung.", source: "QS. Ali 'Imran: 173" },
  { text: "Bertakwalah kepada Allah di mana pun engkau berada, dan iringilah keburukan dengan kebaikan.", source: "HR. Tirmidzi no. 1987" },
  { text: "Dan tolong-menolonglah kamu dalam kebaikan dan ketakwaan.", source: "QS. Al-Ma'idah: 2" },
  { text: "Rida Allah terletak pada rida orang tua, dan murka Allah terletak pada murka orang tua.", source: "HR. Tirmidzi no. 1899" },
  { text: "Boleh jadi kamu membenci sesuatu, padahal ia amat baik bagimu.", source: "QS. Al-Baqarah: 216" },
];

// ─── Animated counter (plain object tween, no DOM side‑effects outside fn) ──
function animateCounter(el: HTMLElement, target: number, duration = 1400) {
  const obj = { val: 0 };
  return anime({
    targets: obj,
    val: target,
    round: 1,
    duration,
    easing: 'easeOutExpo',
    update: () => { el.textContent = String(obj.val); },
  });
}

export default function Dashboard() {
  const { fetchApi } = useApi();
  const [stats, setStats]         = useState({ totalActivities: 0, totalAchievements: 0, totalMembers: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [settings, setSettings]   = useState<any>({});
  const [quotes]                  = useState(() => [...ISLAMIC_QUOTES].sort(() => Math.random() - 0.5));

  // refs — DOM
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const logoRef        = useRef<HTMLDivElement>(null);
  const aboutLeftRef   = useRef<HTMLDivElement>(null);
  const aboutRightRef  = useRef<HTMLDivElement>(null);
  const recruitmentRef = useRef<HTMLDivElement>(null);
  const posterRef      = useRef<HTMLDivElement>(null);
  const activitiesRef  = useRef<HTMLDivElement>(null);
  const ctaRef         = useRef<HTMLDivElement>(null);

  const statsRef       = useRef(stats); // stable ref for counter values

  // keep statsRef in sync and animate counters when data arrives
  useEffect(() => {
    statsRef.current = stats;
    const els = document.querySelectorAll<HTMLElement>('.stat-number');
    if (els.length >= 3 && (stats.totalActivities > 0 || stats.totalAchievements > 0 || stats.totalMembers > 0)) {
      const vals = [stats.totalActivities, stats.totalAchievements, stats.totalMembers];
      els.forEach((el, i) => animateCounter(el, vals[i], 900));
    }
  }, [stats]);

  // ── 1. Fetch data ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const results = await Promise.allSettled([
          fetchApi('/stats'),
          fetchApi('/activities?limit=3'),
          fetchApi('/settings'),
        ]);
        if (cancelled) return;
        const [statsResult, activitiesResult, settingsResult] = results;
        if (statsResult.status === 'fulfilled') setStats(statsResult.value);
        else console.error('Failed to load dashboard stats', statsResult.reason);
        if (activitiesResult.status === 'fulfilled') setActivities(activitiesResult.value);
        else console.error('Failed to load dashboard activities', activitiesResult.reason);
        if (settingsResult.status === 'fulfilled') setSettings(settingsResult.value || {});
        else console.error('Failed to load dashboard settings', settingsResult.reason);
      } catch (e) { console.error('Failed to load dashboard data', e); }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchApi]);

  // ── 2. Canvas particles (hero background) — runs once ────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number | null = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const COUNT = window.innerWidth < 768 ? 16 : 32;
    let isVisible = false;
    let lastFrameTime = 0;
    let width = 0;
    let height = 0;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    resize();

    // throttled resize
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
    window.addEventListener('resize', onResize);

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.3,
      speed: Math.random() * 0.35 + 0.08,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.45 + 0.15,
    }));

    const stop = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
    };
    const scheduleFrame = () => {
      if (raf === null && isVisible && document.visibilityState === 'visible') {
        raf = requestAnimationFrame(draw);
      }
    };
    const draw = (time: number) => {
      raf = null;
      if (!isVisible || document.visibilityState !== 'visible') return;
      if (time - lastFrameTime < 1000 / 30) {
        scheduleFrame();
        return;
      }
      lastFrameTime = time;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.angle += (Math.random() - 0.5) * 0.03;
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134,239,172,${p.opacity})`;
        ctx.fill();
      }
      scheduleFrame();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stop();
      else scheduleFrame();
    };
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) scheduleFrame();
      else stop();
    });
    observer.observe(canvas);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      stop();
      observer.disconnect();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // ── 3. Hero animation — runs once on mount ────────────────────────────────
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll<HTMLElement>('.hero-logo, .hero-letter, .hero-subtitle, .hero-tagline, .hero-ig')
        .forEach(element => {
          element.style.opacity = '1';
          element.style.transform = 'none';
        });
      return;
    }

    const instances: anime.AnimeInstance[] = [];

    const tl = anime.timeline({ easing: 'easeOutExpo' });
    tl
      .add({ targets: '.hero-logo',     opacity: [0, 1], scale: [0.5, 1], duration: 650 })
      .add({ targets: '.hero-letter',   opacity: [0, 1], translateY: [36, 0], delay: anime.stagger(40), duration: 550 }, '-=150')
      .add({ targets: '.hero-subtitle', opacity: [0, 1], translateY: [18, 0], duration: 550 }, '-=350')
      .add({ targets: '.hero-tagline',  opacity: [0, 1], translateY: [18, 0], duration: 550 }, '-=400')
      .add({ targets: '.hero-ig',       opacity: [0, 1], scale: [0.85, 1],   duration: 450 }, '-=300');
    instances.push(tl as any);

    // Logo glow pulse (loop)
    const glow = anime({
      targets: logoRef.current,
      boxShadow: [
        '0 0 0px 0px rgba(74,222,128,0)',
        '0 0 22px 7px rgba(74,222,128,0.45)',
        '0 0 0px 0px rgba(74,222,128,0)',
      ],
      duration: 2800, loop: true, easing: 'easeInOutSine', delay: 1100,
    });
    instances.push(glow);

    // Orb drift (loop)
    const orb1 = anime({
      targets: '.hero-orb-1',
      translateX: ['0%', '7%', '-4%', '0%'],
      translateY: ['0%', '-9%',  '4%', '0%'],
      duration: 9000, loop: true, easing: 'easeInOutSine',
    });
    const orb2 = anime({
      targets: '.hero-orb-2',
      translateX: ['0%', '-7%', '4%', '0%'],
      translateY: ['0%',  '9%', '-4%', '0%'],
      duration: 11000, loop: true, easing: 'easeInOutSine',
    });
    instances.push(orb1, orb2);

    return () => { instances.forEach(instance => instance.pause()); };
  }, []);

  // ── 4. Scroll‑triggered animations ────────────────────────────────────────
  useEffect(() => {
    const loopAnimes: anime.AnimeInstance[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let io: IntersectionObserver | undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => {
      if (reduceMotion) {
        document.querySelectorAll<HTMLElement>('.about-stat-card, .activity-card, .cta-block, .recruit-badge, .recruit-title, .recruit-body, .recruit-items, .recruit-btn')
          .forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
          });
        if (aboutLeftRef.current) aboutLeftRef.current.style.opacity = '1';
        if (posterRef.current) posterRef.current.style.opacity = '1';
        return;
      }

      // Pre‑hide
      document.querySelectorAll<HTMLElement>('.about-stat-card, .cta-block').forEach(el => { el.style.opacity = '0'; });
      if (aboutLeftRef.current)  aboutLeftRef.current.style.opacity  = '0';
      if (posterRef.current)     posterRef.current.style.opacity     = '0';

      io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          if (entry.target === aboutLeftRef.current) {
            anime({ targets: aboutLeftRef.current, opacity: [0, 1], translateX: [-55, 0], duration: 850, easing: 'easeOutCubic' });
          }

          if (entry.target === aboutRightRef.current) {
            anime({
              targets: '.about-stat-card',
              opacity: [0, 1], scale: [0.72, 1], rotate: ['-4deg', '0deg'],
              delay: anime.stagger(140), duration: 850, easing: 'easeOutBack(1.4)',
            });
            timers.push(setTimeout(() => {
              const els = document.querySelectorAll<HTMLElement>('.stat-number');
              const vals = [
                statsRef.current.totalActivities,
                statsRef.current.totalAchievements,
                statsRef.current.totalMembers,
              ];
              els.forEach((el, i) => animateCounter(el, vals[i]));
            }, 500));
          }

          if (entry.target === recruitmentRef.current) {
            anime.timeline({ easing: 'easeOutQuart' })
              .add({ targets: '.recruit-badge', opacity: [0, 1], translateY: [-18, 0], duration: 450 })
              .add({ targets: '.recruit-title', opacity: [0, 1], translateX: [-35, 0], duration: 550 }, '-=200')
              .add({ targets: '.recruit-body',  opacity: [0, 1], translateY: [18, 0],  duration: 550 }, '-=300')
              .add({ targets: '.recruit-items', opacity: [0, 1], translateX: [-18, 0], delay: anime.stagger(120), duration: 480 }, '-=280')
              .add({ targets: '.recruit-btn',   opacity: [0, 1], scale: [0.8, 1],      duration: 450, easing: 'easeOutBack' }, '-=180');
          }

          if (entry.target === posterRef.current) {
            anime({
              targets: posterRef.current,
              opacity: [0, 1], scale: [0.65, 1], rotate: ['10deg', '2deg'],
              duration: 1300, easing: 'easeOutElastic(1, .75)',
              complete: () => {
                const a = anime({
                  targets: posterRef.current,
                  translateY: [-9, 9], rotate: ['2deg', '-1deg'],
                  direction: 'alternate', loop: true, easing: 'easeInOutSine', duration: 3200,
                });
                loopAnimes.push(a);
              },
            });
          }

          if (entry.target === activitiesRef.current) {
            anime({
              targets: '.activity-card',
              opacity: [0, 1], translateY: [55, 0], scale: [0.92, 1],
              delay: anime.stagger(160), duration: 750, easing: 'easeOutBack(1.2)',
            });
          }

          if (entry.target === ctaRef.current) {
            anime({ targets: '.cta-block', opacity: [0, 1], translateY: [45, 0], scale: [0.96, 1], duration: 850, easing: 'easeOutQuart' });
            const a = anime({
              targets: '.cta-icon',
              translateY: [-6, 6], direction: 'alternate', loop: true, easing: 'easeInOutSine', duration: 1800, delay: 850,
            });
            loopAnimes.push(a);
          }

          io.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      [aboutLeftRef, aboutRightRef, recruitmentRef, posterRef, activitiesRef, ctaRef]
        .forEach(r => r.current && io.observe(r.current));

    }, 50);

    return () => {
      clearTimeout(timer);
      timers.forEach(clearTimeout);
      io?.disconnect();
      loopAnimes.forEach(animation => animation.pause());
    };
  }, []);

  // ── Ripple click handler (memoised) ──────────────────────────────────────
  const handleRipple = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    const d   = Math.max(btn.clientWidth, btn.clientHeight);
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    Object.assign(circle.style, {
      position: 'absolute', width: `${d}px`, height: `${d}px`, borderRadius: '50%',
      background: 'rgba(255,255,255,0.32)',
      left: `${e.clientX - rect.left - d / 2}px`,
      top:  `${e.clientY - rect.top  - d / 2}px`,
      pointerEvents: 'none', transform: 'scale(0)', opacity: '1',
    });
    btn.appendChild(circle);
    anime({ targets: circle, scale: [0, 2.4], opacity: [1, 0], duration: 580, easing: 'easeOutQuad',
      complete: () => circle.remove() });
  }, []);

  const hoverIn  = useCallback((e: React.MouseEvent<HTMLElement>) =>
    anime({ targets: e.currentTarget, scale: 1.06, duration: 230, easing: 'easeOutQuad' }), []);
  const hoverOut = useCallback((e: React.MouseEvent<HTMLElement>) =>
    anime({ targets: e.currentTarget, scale: 1, duration: 230, easing: 'easeOutQuad' }), []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="pb-12">

      {/* ── Running Ticker / Quotes Islami ──────────────────────────────── */}
      <section aria-label="Mutiara Hikmah Islami" className="mx-4 lg:mx-8 mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 text-white shadow-md">
        <div className="flex items-center">
          <div className="z-10 flex shrink-0 items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 px-3.5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md">
            <Sparkles size={14} className="text-emerald-200 animate-pulse" />
            <span className="hidden sm:inline">Mutiara Hikmah</span>
            <span className="sm:hidden">Hikmah</span>
          </div>

          <div className="relative flex-1 overflow-hidden py-2.5 text-xs sm:text-sm">
            <div className="animate-marquee flex items-center whitespace-nowrap gap-8">
              {[...quotes, ...quotes].map((item, idx) => (
                <div key={idx} className="inline-flex items-center gap-2 text-slate-200">
                  <span className="text-emerald-400 font-serif text-sm font-bold">“</span>
                  <span className="font-medium text-slate-100">{item.text}</span>
                  <span className="text-emerald-400 font-serif text-sm font-bold">”</span>
                  <span className="inline-block rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-300 border border-emerald-400/30">
                    {item.source}
                  </span>
                  <span className="text-emerald-500/40 ml-3">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 lg:mx-8 mt-6">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
        <div className="hero-orb-1 absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-green-500/25 to-transparent rounded-full blur-3xl will-change-transform" />
        <div className="hero-orb-2 absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-emerald-500/25 to-transparent rounded-full blur-3xl will-change-transform" />

        <div className="relative z-10 px-6 py-12 lg:py-16 text-center max-w-3xl mx-auto flex flex-col items-center">
          <div ref={logoRef} className="hero-logo w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-5 mx-auto overflow-hidden p-1.5 opacity-0 will-change-transform">
            <img src="/logo.png" alt="Logo Rohis" className="w-full h-full object-contain drop-shadow-md"
              onError={e => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=ecfdf5&color=059669'; }} />
          </div>

          <h1 className="hero-title text-3xl lg:text-5xl font-bold mb-3 tracking-tight">
            {'ROHIS AL HAFIDH'.split('').map((character, index) => character === ' '
              ? <span key={index} style={{ display: 'inline-block', width: '.3em' }}> </span>
              : <span key={index} className="hero-letter" style={{ display: 'inline-block', opacity: 0, transform: 'translateY(36px)' }}>{character}</span>)}
          </h1>
          <h2 className="hero-subtitle text-xl lg:text-2xl text-green-400 font-medium mb-4 opacity-0">
            {settings?.schoolName || 'SMKN 1 SEMARANG'}
          </h2>
          <p className="hero-tagline text-base lg:text-lg text-slate-300 max-w-xl mx-auto font-light leading-relaxed opacity-0">
            "{settings?.tagline || 'Semangat Berdakwah, Menjalani Ukhuwah'}"
          </p>
          <a
            href="https://www.instagram.com/rohisalhafidh?igsi=NG9oanVmN3M5NHM5"
            target="_blank" rel="noopener noreferrer"
            className="hero-ig mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#405DE6] via-[#C13584] to-[#F56040] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-pink-500/20 opacity-0 relative overflow-hidden"
            onClick={handleRipple}
            onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current text-white drop-shadow-sm">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
            </svg>
            <span>@rohisalhafidh</span>
          </a>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────────────────── */}
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
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4"><Activity size={24} /></div>
              <span className="stat-number text-3xl font-bold text-slate-800 mb-1">0</span>
              <span className="text-sm text-slate-500 font-medium">Kegiatan</span>
            </div>
            <div className="about-stat-card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4"><Award size={24} /></div>
              <span className="stat-number text-3xl font-bold text-slate-800 mb-1">0</span>
              <span className="text-sm text-slate-500 font-medium">Prestasi</span>
            </div>
            <div className="about-stat-card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center col-span-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Users size={24} /></div>
              <span className="stat-number text-3xl font-bold text-slate-800 mb-1">0</span>
              <span className="text-sm text-slate-500 font-medium">Pengurus &amp; Anggota</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 lg:px-8 mt-12 sm:mt-16 max-w-6xl mx-auto">
        <div className="rounded-2xl sm:rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6 sm:p-8 lg:p-10">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-11 h-11 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
              <Eye size={24} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-green-700 mb-1">Arah dan Tujuan</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Visi</h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Mewujudkan lingkungan sekolah yang religius, berakhlak baik, dan aktif dalam kegiatan keagamaan yang bermanfaat bagi seluruh warga sekolah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefit Bergabung ────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 mt-16 sm:mt-20 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} className="text-emerald-600" />
            <span>Keuntungan Bergabung</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Benefit Bergabung dengan Rohis Al-Hafidh
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
            Temukan banyak peluang dan manfaat nyata untuk bekal masa depan serta pengembangan karakter islami.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === 6;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${
                  isLast ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.color} shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-xs font-extrabold tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      {item.num}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-2 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Recruitment ────────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 mt-14 sm:mt-16 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-blue-800/50">
          <div className="grid md:grid-cols-2 items-center">
            <div ref={recruitmentRef} className="p-6 sm:p-8 lg:p-10 text-white">
              <div className="recruit-badge inline-block bg-blue-500/20 text-blue-300 font-bold px-3 py-1 rounded-full text-xs sm:text-sm mb-4 border border-blue-500/30 opacity-0">
                Pendaftaran Dibuka
              </div>
              <h2 className="recruit-title text-2xl sm:text-3xl font-bold mb-3 leading-tight opacity-0">
                Open Rekrutmen <span className="text-blue-400">Rohis Al Hafidh</span>
              </h2>
              <p className="recruit-body text-slate-300 text-sm sm:text-base mb-6 leading-relaxed opacity-0">
                Mari bergabung bersama kami menjadi bagian dari keluarga besar Rohis Al Hafidh SMKN 1 Semarang periode 2026/2027. Jadikan masa mudamu lebih bermanfaat dan penuh berkah.
              </p>
              <div className="space-y-3 mb-6">
                <div className="recruit-items flex items-start gap-2.5 opacity-0">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 text-xs">✓</div>
                  <div>
                    <h4 className="font-bold text-sm">Syarat &amp; Ketentuan</h4>
                    <p className="text-xs sm:text-sm text-slate-400">Beragama Islam, Disiplin, Tanggung jawab, Sehat jasmani dan rohani, Siap berkontribusi.</p>
                  </div>
                </div>
                <div className="recruit-items flex items-start gap-2.5 opacity-0">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 text-xs">📅</div>
                  <div>
                    <h4 className="font-bold text-sm">Periode Pendaftaran</h4>
                    <p className="text-xs sm:text-sm text-slate-400">1 Oktober - 10 November 2026</p>
                  </div>
                </div>
              </div>
              <a
                href="https://forms.gle/eHZfgLuXhu3aB3sZ9"
                target="_blank" rel="noopener noreferrer"
                className="recruit-btn opacity-0 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-full transition-colors text-center text-sm sm:text-base shadow-md shadow-blue-500/30 inline-block relative overflow-hidden"
                onClick={handleRipple}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              >
                Daftar Sekarang
              </a>
            </div>

            <div className="relative h-full min-h-[260px] sm:min-h-[320px] bg-blue-950/50 flex items-center justify-center p-6 sm:p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 z-0" />
              <div ref={posterRef} className="relative z-10 w-full max-w-[240px] sm:max-w-[270px] rounded-xl overflow-hidden shadow-xl border-2 sm:border-4 border-white/10 bg-slate-800 opacity-0 will-change-transform">
                <img
                  src="/image.png" alt="Poster Open Rekrutmen Rohis"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recent Activities ───────────────────────────────────────────────── */}
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
          {activities.length > 0 ? activities.map(activity => (
            <div
              key={activity.id}
              className="activity-card bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group cursor-pointer hover:shadow-xl transition-shadow will-change-transform"
              onMouseEnter={e => anime({ targets: e.currentTarget, translateY: -7, scale: 1.02, duration: 280, easing: 'easeOutQuad' })}
              onMouseLeave={e => anime({ targets: e.currentTarget, translateY:  0, scale: 1,    duration: 280, easing: 'easeOutQuad' })}
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {activity.coverImage ? (
                  <img src={activity.coverImage} alt={activity.title} loading="lazy" decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400"><Activity size={32} /></div>
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
                <p className="text-slate-600 text-sm line-clamp-2 mb-4">{activity.description}</p>
                <Link to="/gallery" className="text-sm font-bold text-green-600 group-hover:text-green-700">
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

      {/* ── CTA Structure ──────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-8 mt-24 mb-12 max-w-6xl mx-auto text-center" ref={ctaRef}>
        <div className="cta-block bg-slate-900 rounded-3xl p-12 relative overflow-hidden opacity-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: 'linear-gradient(135deg,rgba(74,222,128,0.12),transparent 55%,rgba(74,222,128,0.05))' }} />
          <div className="relative z-10">
            <Users size={48} className="cta-icon mx-auto text-green-400 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Struktur Kepengurusan</h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8">
              Kenali lebih dekat susunan pengurus dan anggota Rohis Al Hafidh periode saat ini.
            </p>
            <Link
              to="/organization"
              className="inline-block bg-white text-slate-900 font-bold px-8 py-3.5 rounded-full shadow-lg relative overflow-hidden"
              onClick={handleRipple as any}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
            >
              Lihat Struktur Lengkap
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
