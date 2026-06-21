import { Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './api'
import MainLayout from './layout/MainLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Sessions from './pages/Sessions.jsx'
import Phones from './pages/Phones.jsx'
import Sms from './pages/Sms.jsx'
import Logs from './pages/Logs.jsx'
import Settings from './pages/Settings.jsx'

function Protected({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="phones" element={<Phones />} />
        <Route path="sms" element={<Sms />} />
        <Route path="logs" element={<Logs />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
