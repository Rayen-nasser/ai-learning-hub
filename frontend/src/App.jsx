import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import { Layout } from './shared/layout';
import AdminRoute from './features/admin/components/AdminRoute';
import Home from './features/home/pages/Home';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import Profile from './features/profile/pages/Profile';
import Formations from './features/formations/pages/Formations';
import FormationDetail from './features/formations/pages/FormationDetail';
import Centres from './features/centres/pages/Centres';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import AdminUsers from './features/admin/pages/AdminUsers';
import AdminReports from './features/admin/pages/AdminReports';
import AdminStatistics from './features/admin/pages/AdminStatistics';
import AdminCategories from './features/admin/pages/AdminCategories';
import AdminSkills from './features/admin/pages/AdminSkills';
import AdminPendingCentres from './features/admin/pages/AdminPendingCentres';
import AdminVerifyCentreDetail from './features/admin/pages/AdminVerifyCentreDetail';
import AdminCentres from './features/admin/pages/AdminCentres';

import ApplyCentre from './features/centres/pages/ApplyCentre';
import MyRequests from './features/centres/pages/MyRequests';

import ResponsableCFRoute from './features/responsableCF/components/ResponsableCFRoute';
import ResponsableDashboard from './features/responsableCF/pages/ResponsableDashboard';
import ResponsableCentres from './features/responsableCF/pages/ResponsableCentres';
import ResponsableFormations from './features/responsableCF/pages/ResponsableFormations';
import ResponsableInscriptions from './features/responsableCF/pages/ResponsableInscriptions';
import ResponsablePayments from './features/responsableCF/pages/ResponsablePayments';
import FormateurRoute from './features/formateur/components/FormateurRoute';
import FormateurDashboard from './features/formateur/pages/FormateurDashboard';
import FormateurFormations from './features/formateur/pages/FormateurFormations';
import FormateurFormationDetail from './features/formateur/pages/FormateurFormationDetail';
import FormateurLessonDetail from './features/formateur/pages/FormateurLessonDetail';
import ApprenantRoute from './features/apprenant/components/ApprenantRoute';
import ApprenantDashboard from './features/apprenant/pages/ApprenantDashboard';
import ApprenantFormations from './features/apprenant/pages/ApprenantFormations';
import ApprenantLearning from './features/apprenant/pages/ApprenantLearning';
import ApprenantPaiements from './features/apprenant/pages/ApprenantPaiements';
import ApprenantFavoris from './features/apprenant/pages/ApprenantFavoris';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="profile" element={<Profile />} />
            <Route path="formations" element={<Formations />} />
            <Route path="formations/:id" element={<FormationDetail />} />
            <Route path="centres" element={<Centres />} />
            <Route path="centres/apply" element={<ApplyCentre />} />
            <Route path="centres/my-requests" element={<MyRequests />} />
          </Route>

          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          <Route path="/admin/reports" element={
            <AdminRoute>
              <AdminReports />
            </AdminRoute>
          } />
          <Route path="/admin/statistics" element={
            <AdminRoute>
              <AdminStatistics />
            </AdminRoute>
          } />
          <Route path="/admin/categories" element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          } />
          <Route path="/admin/skills" element={
            <AdminRoute>
              <AdminSkills />
            </AdminRoute>
          } />
          <Route path="/admin/centres" element={
            <AdminRoute>
              <AdminCentres />
            </AdminRoute>
          } />
          <Route path="/admin/centres/verify" element={
            <AdminRoute>
              <AdminPendingCentres />
            </AdminRoute>
          } />
          <Route path="/admin/centres/verify/:id" element={
            <AdminRoute>
              <AdminVerifyCentreDetail />
            </AdminRoute>
          } />

          <Route path="/responsable" element={
            <ResponsableCFRoute>
              <ResponsableDashboard />
            </ResponsableCFRoute>
          } />
          <Route path="/responsable/centres" element={
            <ResponsableCFRoute>
              <ResponsableCentres />
            </ResponsableCFRoute>
          } />
          <Route path="/responsable/formations" element={
            <ResponsableCFRoute>
              <ResponsableFormations />
            </ResponsableCFRoute>
          } />
          <Route path="/responsable/inscriptions" element={
            <ResponsableCFRoute>
              <ResponsableInscriptions />
            </ResponsableCFRoute>
          } />
          <Route path="/responsable/payments" element={
            <ResponsableCFRoute>
              <ResponsablePayments />
            </ResponsableCFRoute>
          } />
          <Route path="/responsable/categories" element={
            <ResponsableCFRoute>
              <AdminCategories />
            </ResponsableCFRoute>
          } />
          <Route path="/responsable/my-requests" element={
            <ResponsableCFRoute>
              <MyRequests />
            </ResponsableCFRoute>
          } />
          <Route path="/formateur" element={
            <FormateurRoute>
              <FormateurDashboard />
            </FormateurRoute>
          } />
          <Route path="/formateur/formations" element={
            <FormateurRoute>
              <FormateurFormations />
            </FormateurRoute>
          } />
          <Route path="/formateur/formations/:id" element={
            <FormateurRoute>
              <FormateurFormationDetail />
            </FormateurRoute>
          } />
          <Route path="/formateur/formations/:id/lessons/:lessonId" element={
            <FormateurRoute>
              <FormateurLessonDetail />
            </FormateurRoute>
          } />
          <Route path="/apprenant" element={
            <ApprenantRoute>
              <ApprenantDashboard />
            </ApprenantRoute>
          } />
          <Route path="/apprenant/formations" element={
            <ApprenantRoute>
              <ApprenantFormations />
            </ApprenantRoute>
          } />
          <Route path="/apprenant/learn/:formationId" element={
            <ApprenantRoute>
              <ApprenantLearning />
            </ApprenantRoute>
          } />
          <Route path="/apprenant/paiements" element={
            <ApprenantRoute>
              <ApprenantPaiements />
            </ApprenantRoute>
          } />
          <Route path="/apprenant/favoris" element={
            <ApprenantRoute>
              <ApprenantFavoris />
            </ApprenantRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
