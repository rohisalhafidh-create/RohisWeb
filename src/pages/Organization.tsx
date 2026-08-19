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

  const MemberCard = ({ member }: { member: any }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 mb-4 border-4 border-green-50">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
            <User size={32} />
          </div>
        )}
      </div>
      <h3 className="font-bold text-slate-800">{member.name}</h3>
      <p className="text-sm font-medium text-green-600 mt-1">{member.position}</p>
      {member.description && (
        <p className="text-xs text-slate-500 mt-3">{member.description}</p>
      )}
    </div>
  );

  const Section = ({ title, members, gridCols = 3 }: { title: string, members: any[], gridCols?: number }) => {
    if (members.length === 0) return null;
    return (
      <div className="mb-16">
        <h2 className="text-xl font-bold text-center text-slate-800 mb-8 relative inline-block left-1/2 -translate-x-1/2">
          {title}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-green-500 rounded-full" />
        </h2>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridCols} gap-6 max-w-4xl mx-auto justify-center`}>
          {/* @ts-expect-error React 19 key prop type */}
          {members.map(m => <MemberCard key={m.id} member={m} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-16 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Users size={32} />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">Struktur Organisasi</h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
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
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto mb-16">
            <Section title="Pembina Putra" members={getByCategory('Pembina Putra')} gridCols={1} />
            <Section title="Pembina Putri" members={getByCategory('Pembina Putri')} gridCols={1} />
          </div>

          <div className="w-px h-16 bg-slate-200 mx-auto -mt-8 mb-8" />

          {/* Pengurus Inti */}
          <Section title="Pengurus Inti" members={getByCategory('Pengurus Inti')} gridCols={3} />

          <div className="w-px h-16 bg-slate-200 mx-auto -mt-8 mb-8" />

          {/* Anggota */}
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
              <Section title="Divisi Putra" members={getByCategory('Anggota Putra')} gridCols={2} />
            </div>
            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
              <Section title="Divisi Putri" members={getByCategory('Anggota Putri')} gridCols={2} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
