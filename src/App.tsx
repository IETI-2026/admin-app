import { useMemo } from 'react';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
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

  const currentPath = useMemo(() => window.location.pathname, []);

  if (currentPath === '/auth/callback') {
    return (
      <AuthCallbackPage
        onComplete={completeOAuthLogin}
        onRefreshProfile={refreshProfile}
      />
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <LoginPage
        isLoading={authState.isLoading}
        error={authState.error}
        onLogin={login}
        onGoogleLogin={loginWithGoogle}
      />
    );
  }

  return <DashboardPage authState={authState} onLogout={logout} />;
}

export default App;
