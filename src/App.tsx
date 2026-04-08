import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { CreateAdminPage } from './pages/CreateAdminPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProviderDocumentsPage } from './pages/ProviderDocumentsPage'
import { ReviewQueuePage } from './pages/ReviewQueuePage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']} />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/review-queue" replace />} />
            <Route path="/review-queue" element={<ReviewQueuePage />} />
            <Route path="/providers/:providerUserId" element={<ProviderDocumentsPage />} />

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/users/new" element={<CreateAdminPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
