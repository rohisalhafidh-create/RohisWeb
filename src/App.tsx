/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public pages
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Achievements from './pages/Achievements';
import Organization from './pages/Organization';
import AdminLogin from './pages/AdminLogin';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminActivities from './pages/admin/AdminActivities';
import AdminAchievements from './pages/admin/AdminAchievements';
import AdminOrganization from './pages/admin/AdminOrganization';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="organization" element={<Organization />} />
        </Route>
        
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="activities" element={<AdminActivities />} />
          <Route path="achievements" element={<AdminAchievements />} />
          <Route path="organization" element={<AdminOrganization />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
