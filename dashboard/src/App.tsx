import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import uzUZ from 'antd/locale/uz_UZ'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from './components/Layout/MainLayout'
import ProtectedRoute from './components/Common/ProtectedRoute'
import ErrorBoundary from './components/Common/ErrorBoundary'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Ads from './pages/Ads/Ads'
import AdsCreate from './pages/Ads/AdsCreate'
import AdsEdit from './pages/Ads/AdsEdit'
import Sessions from './pages/Sessions/Sessions'
import Groups from './pages/Groups/Groups'
import Posts from './pages/Posts/Posts'
import Payments from './pages/Payments/Payments'
import Analytics from './pages/Analytics/Analytics'
import Settings from './pages/Settings/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
  },
  algorithm: theme.defaultAlgorithm,
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme} locale={uzUZ}>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="ads" element={<Ads />} />
              <Route path="ads/create" element={<AdsCreate />} />
              <Route path="ads/:id/edit" element={<AdsEdit />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="groups" element={<Groups />} />
              <Route path="posts" element={<Posts />} />
              <Route path="payments" element={<Payments />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
