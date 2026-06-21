import { useSocket } from '../../hooks/useSocket'

/**
 * SocketProvider — App darajasida WebSocket ulanishini boshqaradi
 * Barcha real-time eventlar shu orqali React Query cache ga yoziladi
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  // WebSocket ulanish + event listener'lar aktivlashadi
  useSocket()
  return <>{children}</>
}
