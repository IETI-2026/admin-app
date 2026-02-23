import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { ProfilePage } from './modules/auth/pages/ProfilePage';
import { ProvidersAdminPage } from './modules/providers/pages/ProvidersAdminPage';
import { ServiceRequestsAdminPage } from './modules/service-requests/pages/ServiceRequestsAdminPage';
import { SystemSettingsPage } from './modules/settings/pages/SystemSettingsPage';
import { UsersAdminPage } from './modules/users/pages/UsersAdminPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { LoginPage } from './pages/LoginPage';
import { useAuthSession } from './modules/auth/hooks/useAuthSession';

function App() {
  const {
    authState,
    login,
    logout,
    loginWithGoogle,
    completeOAuthLogin,
    refreshProfile,
  } = useAuthSession();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={authState.isAuthenticated ? '/dashboard' : '/login'} replace />}
      />

      <Route
        path="/auth/callback"
        element={
          <AuthCallbackPage
            onComplete={completeOAuthLogin}
            onRefreshProfile={refreshProfile}
          />
        }
      />

      <Route
        path="/login"
        element={
          authState.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage
              isLoading={authState.isLoading}
              error={authState.error}
              onLogin={login}
              onGoogleLogin={loginWithGoogle}
            />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          authState.isAuthenticated ? (
            <AdminLayout authState={authState} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<DashboardHomePage />} />
        <Route path="users" element={<UsersAdminPage />} />
        <Route path="technicians" element={<ProvidersAdminPage />} />
        <Route path="requests" element={<ServiceRequestsAdminPage />} />
        <Route path="settings" element={<SystemSettingsPage />} />
        <Route path="profile" element={<ProfilePage onRefreshProfile={refreshProfile} />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={authState.isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;
