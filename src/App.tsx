/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const PublicLayout = lazy(() => import('./layouts/PublicLayout').then(module => ({ default: module.PublicLayout })));
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then(module => ({ default: module.AdminLayout })));
const AuthProvider = lazy(() => import('./lib/AuthContext').then(module => ({ default: module.AuthProvider })));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Organization = lazy(() => import('./pages/Organization'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminActivities = lazy(() => import('./pages/admin/AdminActivities'));
const AdminAchievements = lazy(() => import('./pages/admin/AdminAchievements'));
const AdminOrganization = lazy(() => import('./pages/admin/AdminOrganization'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" aria-label="Memuat halaman" />}>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="organization" element={<Organization />} />
        </Route>

        <Route path="/admin/login" element={<AuthProvider><AdminLogin /></AuthProvider>} />

        <Route path="/admin" element={<AuthProvider><AdminLayout /></AuthProvider>}>
          <Route index element={<AdminDashboard />} />
          <Route path="activities" element={<AdminActivities />} />
          <Route path="achievements" element={<AdminAchievements />} />
          <Route path="organization" element={<AdminOrganization />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
