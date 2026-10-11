import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Organization() {
  const { fetchApi } = useApi();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrg = async () => {
      try {
        const data = await fetchApi('/organization');
        setMembers(data);
      } catch (e) {
        console.error('Failed to load organization', e);
      } finally {
        setLoading(false);
      }
    };
    loadOrg();
  }, [fetchApi]);

  const getByCategory = (category: string, gender?: string) => {
    return members.filter(m => m.category === category && (!gender || m.gender === gender));
  };

  const MemberCard = ({ member }: { member: any; key?: React.Key }) => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all h-full">
      <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-100 mb-2 sm:mb-4 border-2 sm:border-4 border-green-50 shrink-0">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
            <User className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        )}
      </div>
      <h3 className="font-bold text-slate-800 text-xs sm:text-base leading-snug line-clamp-2">{member.name}</h3>
      <p className="text-[11px] sm:text-sm font-medium text-green-600 mt-0.5 sm:mt-1 truncate max-w-full">{member.position}</p>
      {(member.className || member.class_name) && (
        <span className="inline-block mt-1 sm:mt-2 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100/60 truncate max-w-full">
          {member.className || member.class_name}
        </span>
      )}
      {member.description && (
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 sm:mt-3 line-clamp-2 hidden sm:block">{member.description}</p>
      )}
    </div>
  );

  const Section = ({ title, members, gridCols = 3 }: { title: string, members: any[], gridCols?: number }) => {
    if (members.length === 0) return null;
    const desktopCols = gridCols === 1 ? 'lg:grid-cols-1' : gridCols === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';
    return (
      <div className="mb-8 sm:mb-16">
        <h2 className="text-sm sm:text-xl font-bold text-center text-slate-800 mb-4 sm:mb-8 relative inline-block left-1/2 -translate-x-1/2">
          {title}
          <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-green-500 rounded-full" />
        </h2>
        <div className={`grid grid-cols-2 ${desktopCols} gap-2.5 sm:gap-6 max-w-4xl mx-auto justify-center`}>
          {members.map(m => <MemberCard key={m.id} member={m} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8">
      <div className="mb-8 sm:mb-16 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
          <Users className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2 sm:mb-4">Struktur Organisasi</h1>
        <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto">
          Susunan kepengurusan Rohis Al Hafidh SMKN 1 Semarang.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative">
          {/* Pembina */}
          <div className="grid grid-cols-2 gap-3 sm:gap-12 max-w-4xl mx-auto mb-8 sm:mb-16">
            <Section title="Pembina Putra" members={getByCategory('Pembina Putra')} gridCols={1} />
            <Section title="Pembina Putri" members={getByCategory('Pembina Putri')} gridCols={1} />
          </div>

          <div className="w-px h-12 sm:h-16 bg-slate-200 mx-auto -mt-4 sm:-mt-8 mb-6 sm:mb-8" />

          {/* Pengurus Inti */}
          <Section title="Pengurus Inti" members={getByCategory('Pengurus Inti')} gridCols={3} />

          <div className="w-px h-12 sm:h-16 bg-slate-200 mx-auto -mt-4 sm:-mt-8 mb-6 sm:mb-8" />

          {/* Anggota */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-12 max-w-6xl mx-auto">
            <div className="bg-slate-50/50 rounded-2xl sm:rounded-3xl p-3 sm:p-8 border border-slate-100">
              <Section title="Divisi Putra" members={getByCategory('Anggota Putra')} gridCols={2} />
            </div>
            <div className="bg-slate-50/50 rounded-2xl sm:rounded-3xl p-3 sm:p-8 border border-slate-100">
              <Section title="Divisi Putri" members={getByCategory('Anggota Putri')} gridCols={2} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
