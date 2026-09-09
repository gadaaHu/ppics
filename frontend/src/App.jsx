import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout/Layout';
import MemberLayout from './components/common/Layout/MemberLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PublicGalleryPage from './pages/public/GalleryPage';
import PublicationsPage from './pages/public/PublicationsPage';
import PublicEventsPage from './pages/public/PublicEventsPage';
import PublicNewsPage from './pages/public/PublicNewsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import HierarchyPage from './pages/admin/HierarchyPage';
import MembersPage from './pages/admin/MembersPage';
import PlansPage from './pages/admin/PlansPage';
import GalleryPage from './pages/admin/GalleryPage';
import DistrictsPage from './pages/admin/DistrictsPage';
import CooperativesPage from './pages/admin/CooperativesPage';
import FamiliesPage from './pages/admin/FamiliesPage';
import PositionsPage from './pages/admin/PositionsPage';
import EventsPage from './pages/admin/EventsPage';
import AttendancePage from './pages/admin/AttendancePage';
import BarcodeAttendancePage from './pages/admin/BarcodeAttendancePage';
import NewsPage from './pages/admin/NewsPage';
import AdminELearningPage from './pages/admin/AdminELearningPage';
import AdminPublicationsPage from './pages/admin/AdminPublicationsPage';
import MemberEvaluations from './pages/admin/MemberEvaluations';
import MemberPayments from './pages/admin/MemberPayments';
import SettingsPage from './pages/admin/SettingsPage';
import SocialMediaPage from './pages/admin/SocialMediaPage';
import UsersPage from './pages/admin/UsersPage';
import UserProfile from './pages/admin/UserProfile';
import PrintMemberPage from './pages/admin/PrintMemberPage';

// Leader Pages
import LeaderDashboard from './pages/leader/LeaderDashboard';

// Family Leader Pages
import FamilyLeaderDashboard from './pages/family_leader/FamilyLeaderDashboard';
import FamilyMembersPage from './pages/family_leader/FamilyMembersPage';

// Member Pages
import MemberDashboard from './pages/member/MemberDashboard';
import FamilyPlans from './pages/member/FamilyPlans';
import MemberProfile from './pages/member/MemberProfile';
import MemberMembersPage from './pages/member/MemberMembersPage';
import AddMemberPage from './pages/member/AddMemberPage';
import MemberELearningPage from './pages/member/MemberELearningPage';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gallery" element={<PublicGalleryPage />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/e-learning" element={<MemberELearningPage />} />
          <Route path="/events" element={<PublicEventsPage />} />
          <Route path="/news" element={<PublicNewsPage />} />

          {/* ==================== ADMIN ROUTES ==================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/districts"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <DistrictsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cooperatives"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <CooperativesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/families"
            element={
              <ProtectedRoute allowedRoles={['admin', 'family_leader']}>
                <Layout>
                  <FamiliesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <ProtectedRoute allowedRoles={['admin', 'family_leader']}>
                <Layout>
                  <MembersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/positions"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <PositionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hierarchy"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <HierarchyPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <GalleryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <EventsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AttendancePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/barcode"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <BarcodeAttendancePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <NewsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <PlansPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin - E-Learning & Publications Routes */}
          <Route
            path="/admin/publications"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AdminPublicationsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/e-learning"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AdminELearningPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin - Evaluations & Payments */}
          <Route
            path="/admin/evaluations"
            element={
              <ProtectedRoute allowedRoles={['admin', 'leader', 'family_leader']}>
                <Layout>
                  <MemberEvaluations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={['admin', 'leader', 'family_leader']}>
                <Layout>
                  <MemberPayments />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin - Settings, Social, Users */}
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/social"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <SocialMediaPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <UsersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <UserProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Print Member ID Card */}
          <Route
            path="/print-member/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'leader', 'family_leader', 'member']}>
                <PrintMemberPage />
              </ProtectedRoute>
            }
          />

          {/* ==================== LEADER ROUTES ==================== */}
          <Route
            path="/leader"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <LeaderDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader/dashboard"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <LeaderDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader/members"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <MembersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader/hierarchy"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <HierarchyPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader/plans"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <PlansPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader/social"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <SocialMediaPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Leader 2 Routes */}
          <Route
            path="/leader2"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <LeaderDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader2/dashboard"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <LeaderDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader2/members"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <MembersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader2/hierarchy"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <HierarchyPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader2/plans"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <PlansPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader2/social"
            element={
              <ProtectedRoute allowedRoles={['leader']}>
                <Layout>
                  <SocialMediaPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ==================== FAMILY LEADER ROUTES ==================== */}
          <Route
            path="/family-leader"
            element={
              <ProtectedRoute allowedRoles={['family_leader']}>
                <Layout>
                  <FamilyLeaderDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/family-leader/dashboard"
            element={
              <ProtectedRoute allowedRoles={['family_leader']}>
                <Layout>
                  <FamilyLeaderDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/family-leader/members"
            element={
              <ProtectedRoute allowedRoles={['family_leader']}>
                <Layout>
                  <FamilyMembersPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ==================== MEMBER ROUTES ==================== */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberLayout>
                  <MemberDashboard />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/dashboard"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberLayout>
                  <MemberDashboard />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/family-plans"
            element={
              <ProtectedRoute allowedRoles={['member', 'leader', 'admin']}>
                <MemberLayout>
                  <FamilyPlans />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/profile"
            element={
              <ProtectedRoute allowedRoles={['member', 'leader', 'admin']}>
                <MemberLayout>
                  <MemberProfile />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/members"
            element={
              <ProtectedRoute allowedRoles={['member', 'leader', 'admin']}>
                <MemberLayout>
                  <MemberMembersPage />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/e-learning"
            element={
              <ProtectedRoute allowedRoles={['member', 'leader', 'admin']}>
                <MemberLayout>
                  <MemberELearningPage />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/events"
            element={
              <ProtectedRoute allowedRoles={['member', 'leader', 'admin']}>
                <MemberLayout>
                  <PublicEventsPage />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/publications"
            element={
              <ProtectedRoute allowedRoles={['member', 'leader', 'admin']}>
                <MemberLayout>
                  <PublicationsPage />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/gallery"
            element={
              <ProtectedRoute allowedRoles={['member', 'leader', 'admin']}>
                <MemberLayout>
                  <PublicGalleryPage />
                </MemberLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/add-member"
            element={
              <ProtectedRoute allowedRoles={['member', 'leader', 'admin']}>
                <MemberLayout>
                  <AddMemberPage />
                </MemberLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== 404 NOT FOUND ==================== */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Page not found</p>
                  <a href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;