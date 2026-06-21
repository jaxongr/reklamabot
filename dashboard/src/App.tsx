import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme, Spin } from 'antd'
import uzUZ from 'antd/locale/uz_UZ'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from './components/Layout/MainLayout'
import { SocketProvider } from './components/Common/SocketProvider'
import ProtectedRoute from './components/Common/ProtectedRoute'
import { ModuleProvider } from './contexts/ModuleContext'
import ErrorBoundary from './components/Common/ErrorBoundary'

// Core pages (eagerly loaded)
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Orders from './pages/Orders/Orders'
import Monitor from './pages/Monitor/Monitor'
import Sessions from './pages/Sessions/Sessions'

// Lazy-loaded pages
const Ads = lazy(() => import('./pages/Ads/Ads'))
const AdsCreate = lazy(() => import('./pages/Ads/AdsCreate'))
const AdsEdit = lazy(() => import('./pages/Ads/AdsEdit'))
const Groups = lazy(() => import('./pages/Groups/Groups'))
const Posts = lazy(() => import('./pages/Posts/Posts'))
const Payments = lazy(() => import('./pages/Payments/Payments'))
const Analytics = lazy(() => import('./pages/Analytics/Analytics'))
const Settings = lazy(() => import('./pages/Settings/Settings'))
const YoldaGeoZones = lazy(() => import('./pages/YoldaDispatcher/YoldaGeoZones'))
const YoldaDispatchers = lazy(() => import('./pages/YoldaDispatcher/YoldaDispatchers'))
const YoldaCalls = lazy(() => import('./pages/YoldaDispatcher/YoldaCalls'))
const YoldaBlocklist = lazy(() => import('./pages/YoldaDispatcher/YoldaBlocklist'))
const YoldaRequests = lazy(() => import('./pages/YoldaDispatcher/YoldaRequests'))
const Users = lazy(() => import('./pages/Users/Users'))
const ClosedDeals = lazy(() => import('./pages/ClosedDeals/ClosedDeals'))
const Locations = lazy(() => import('./pages/Locations/Locations'))
const BlockedUsers = lazy(() => import('./pages/BlockedUsers/BlockedUsers'))
const Drivers = lazy(() => import('./pages/Drivers/Drivers'))
const RouteAnalytics = lazy(() => import('./pages/Analytics/RouteAnalytics'))
const VehicleStats = lazy(() => import('./pages/Analytics/VehicleStats'))
const DayRouteAnalytics = lazy(() => import('./pages/Analytics/DayRouteAnalytics'))
const PriceEstimator = lazy(() => import('./pages/Analytics/PriceEstimator'))
const ExportData = lazy(() => import('./pages/Analytics/ExportData'))
const TopGroups = lazy(() => import('./pages/Analytics/TopGroups'))
const TopPhones = lazy(() => import('./pages/Analytics/TopPhones'))
const SessionStats = lazy(() => import('./pages/Analytics/SessionStats'))
const SenderRetention = lazy(() => import('./pages/Analytics/SenderRetention'))
const SpamDetection = lazy(() => import('./pages/Analytics/SpamDetection'))
const GroupEfficiency = lazy(() => import('./pages/Analytics/GroupEfficiency'))
const UserActivity = lazy(() => import('./pages/Analytics/UserActivity'))
const CargoBot = lazy(() => import('./pages/CargoBot/CargoBot'))
const Notifications = lazy(() => import('./pages/Notifications/Notifications'))
const ChatPanel = lazy(() => import('./pages/Chat/ChatPanel'))
const SupportDashboard = lazy(() => import('./pages/Support/SupportDashboard'))
const SmsSettings = lazy(() => import('./pages/Settings/SmsSettings'))
const RoleManagement = lazy(() => import('./pages/Settings/RoleManagement'))
const StaffManagement = lazy(() => import('./pages/Staff/StaffManagement'))
const MyOrders = lazy(() => import('./pages/MyOrders/MyOrders'))
const AcceptedOrders = lazy(() => import('./pages/AcceptedOrders/AcceptedOrders'))
const TelegramSms = lazy(() => import('./pages/TelegramSms/TelegramSms'))
const UniquePhones = lazy(() => import('./pages/UniquePhones/UniquePhones'))
const OnlineUsers = lazy(() => import('./pages/Users/OnlineUsers'))
const Accounting = lazy(() => import('./pages/Accounting/Accounting'))
const DispatchersMap = lazy(() => import('./pages/DispatchersMap/DispatchersMap'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 2_000,         // 2 sek — WS event tez ko'rinishi uchun
      gcTime: 5 * 60_000,       // 5 min — cache'ni ushlab turish
      placeholderData: (prev: any) => prev,  // yangi data kelguncha eski ko'rinadi
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

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Spin size="large" />
  </div>
)

function App() {
  return (
    <ModuleProvider>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme} locale={uzUZ}>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SocketProvider>
                    <MainLayout />
                  </SocketProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="monitor" element={<Monitor />} />
              <Route path="cargo-bot" element={<Suspense fallback={<PageLoader />}><CargoBot /></Suspense>} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="ads" element={<Suspense fallback={<PageLoader />}><Ads /></Suspense>} />
              <Route path="ads/create" element={<Suspense fallback={<PageLoader />}><AdsCreate /></Suspense>} />
              <Route path="ads/:id/edit" element={<Suspense fallback={<PageLoader />}><AdsEdit /></Suspense>} />
              <Route path="groups" element={<Suspense fallback={<PageLoader />}><Groups /></Suspense>} />
              <Route path="posts" element={<Suspense fallback={<PageLoader />}><Posts /></Suspense>} />
              <Route path="payments" element={<Suspense fallback={<PageLoader />}><Payments /></Suspense>} />
              <Route path="accounting" element={<Suspense fallback={<PageLoader />}><Accounting /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<PageLoader />}><Users /></Suspense>} />
              <Route path="closed-deals" element={<Suspense fallback={<PageLoader />}><ClosedDeals /></Suspense>} />
              <Route path="locations" element={<Suspense fallback={<PageLoader />}><Locations /></Suspense>} />
              <Route path="blocked-users" element={<Suspense fallback={<PageLoader />}><BlockedUsers /></Suspense>} />
              <Route path="drivers" element={<Suspense fallback={<PageLoader />}><Drivers /></Suspense>} />
              <Route path="analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
              <Route path="analytics/routes" element={<Suspense fallback={<PageLoader />}><RouteAnalytics /></Suspense>} />
              <Route path="analytics/vehicle-types" element={<Suspense fallback={<PageLoader />}><VehicleStats /></Suspense>} />
              <Route path="analytics/day-routes" element={<Suspense fallback={<PageLoader />}><DayRouteAnalytics /></Suspense>} />
              <Route path="analytics/price-estimate" element={<Suspense fallback={<PageLoader />}><PriceEstimator /></Suspense>} />
              <Route path="analytics/export" element={<Suspense fallback={<PageLoader />}><ExportData /></Suspense>} />
              <Route path="analytics/top-groups" element={<Suspense fallback={<PageLoader />}><TopGroups /></Suspense>} />
              <Route path="analytics/top-phones" element={<Suspense fallback={<PageLoader />}><TopPhones /></Suspense>} />
              <Route path="analytics/session-stats" element={<Suspense fallback={<PageLoader />}><SessionStats /></Suspense>} />
              <Route path="analytics/sender-retention" element={<Suspense fallback={<PageLoader />}><SenderRetention /></Suspense>} />
              <Route path="analytics/spam-detection" element={<Suspense fallback={<PageLoader />}><SpamDetection /></Suspense>} />
              <Route path="analytics/group-efficiency" element={<Suspense fallback={<PageLoader />}><GroupEfficiency /></Suspense>} />
              <Route path="analytics/user-activity" element={<Suspense fallback={<PageLoader />}><UserActivity /></Suspense>} />
              <Route path="notifications" element={<Suspense fallback={<PageLoader />}><Notifications /></Suspense>} />
              <Route path="chat" element={<Suspense fallback={<PageLoader />}><ChatPanel /></Suspense>} />
              <Route path="support" element={<Suspense fallback={<PageLoader />}><SupportDashboard /></Suspense>} />
              <Route path="my-orders" element={<Suspense fallback={<PageLoader />}><MyOrders /></Suspense>} />
              <Route path="accepted-orders" element={<Suspense fallback={<PageLoader />}><AcceptedOrders /></Suspense>} />
              <Route path="staff" element={<Suspense fallback={<PageLoader />}><StaffManagement /></Suspense>} />
              <Route path="sms" element={<Suspense fallback={<PageLoader />}><SmsSettings /></Suspense>} />
              <Route path="roles" element={<Suspense fallback={<PageLoader />}><RoleManagement /></Suspense>} />
              <Route path="telegram-sms" element={<Suspense fallback={<PageLoader />}><TelegramSms /></Suspense>} />
              <Route path="unique-phones" element={<Suspense fallback={<PageLoader />}><UniquePhones /></Suspense>} />
              <Route path="online-users" element={<Suspense fallback={<PageLoader />}><OnlineUsers /></Suspense>} />
              <Route path="dispatchers/map" element={<Suspense fallback={<PageLoader />}><DispatchersMap /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
              <Route path="yolda/geozones" element={<Suspense fallback={<PageLoader />}><YoldaGeoZones /></Suspense>} />
              <Route path="yolda/dispatchers" element={<Suspense fallback={<PageLoader />}><YoldaDispatchers /></Suspense>} />
              <Route path="yolda/calls" element={<Suspense fallback={<PageLoader />}><YoldaCalls /></Suspense>} />
              <Route path="yolda/blocklist" element={<Suspense fallback={<PageLoader />}><YoldaBlocklist /></Suspense>} />
              <Route path="yolda/requests" element={<Suspense fallback={<PageLoader />}><YoldaRequests /></Suspense>} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </ConfigProvider>
    </QueryClientProvider>
    </ModuleProvider>
  )
}

export default App
