import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('/api/v1', '')

let globalSocket: Socket | null = null
let refCount = 0

function getSocket(): Socket {
  if (!globalSocket) {
    const token = localStorage.getItem('token')
    globalSocket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      query: { deviceType: 'dashboard' },
    })

    globalSocket.on('connect', () => {
      console.log('[WS] Connected:', globalSocket?.id)
    })

    globalSocket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason)
    })

    globalSocket.on('connect_error', (err) => {
      console.warn('[WS] Connection error:', err.message)
    })
  }
  return globalSocket
}

function releaseSocket() {
  if (refCount <= 0 && globalSocket) {
    globalSocket.disconnect()
    globalSocket = null
  }
}

/**
 * WebSocket hook — React Query cache avtomatik yangilash
 * Order:new, block:new, order:stats eventlarni tinglaydi
 * Debounce bilan — ko'p event kelsa bitta refetch
 */
export function useSocket() {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket
    refCount++

    // Debounce timer lar — tez-tez refetch qilmaslik uchun
    const timers: Record<string, ReturnType<typeof setTimeout>> = {}
    const debounceInvalidate = (keys: string[][], delay = 500) => {
      const key = keys.map(k => k.join('.')).join('|')
      clearTimeout(timers[key])
      timers[key] = setTimeout(() => {
        keys.forEach(k => queryClient.invalidateQueries({ queryKey: k }))
      }, delay)
    }

    // Yangi order kelganda — darhol cache yangilash
    const onNewOrder = (orderData: any) => {
      // Darhol orders cache ga qo'shish (refetch kutmasdan)
      queryClient.setQueriesData({ queryKey: ['orders'] }, (old: any) => {
        if (!old?.data) return old
        return { ...old, data: [orderData, ...old.data].slice(0, old.data.length) }
      })
      // Stats va analytics sekinroq yangilash
      debounceInvalidate([['orders'], ['order-stats'], ['analytics']], 500)
    }

    // Order stats
    const onOrderStats = () => {
      debounceInvalidate([['order-stats']], 2000)
    }

    // Yangi block
    const onNewBlock = () => {
      debounceInvalidate([['blocked-users'], ['blocked-users', 'stats']], 500)
    }

    // Session status
    const onSessionUpdate = () => {
      debounceInvalidate([['monitor'], ['sessions']], 300)
    }

    // Posting progress
    const onPostingUpdate = () => {
      debounceInvalidate([['posts']], 300)
    }

    // Driver status change (online/offline) — refetch map
    const onDriverStatus = () => {
      debounceInvalidate([['drivers'], ['onlineDriversMap']], 500)
    }

    socket.on('order:new', onNewOrder)
    socket.on('order:stats', onOrderStats)
    socket.on('block:new', onNewBlock)
    socket.on('session:update', onSessionUpdate)
    socket.on('posting:update', onPostingUpdate)
    socket.on('driver:statusChange', onDriverStatus)

    return () => {
      Object.values(timers).forEach(clearTimeout)
      socket.off('order:new', onNewOrder)
      socket.off('order:stats', onOrderStats)
      socket.off('block:new', onNewBlock)
      socket.off('session:update', onSessionUpdate)
      socket.off('posting:update', onPostingUpdate)
      socket.off('driver:statusChange', onDriverStatus)
      refCount--
      if (refCount <= 0) {
        releaseSocket()
      }
    }
  }, [queryClient])

  return socketRef.current
}

/**
 * Custom event listener hook
 */
export function useSocketEvent<T = any>(event: string, callback: (data: T) => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const socket = getSocket()
    refCount++

    const handler = (data: T) => callbackRef.current(data)
    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
      refCount--
      if (refCount <= 0) {
        releaseSocket()
      }
    }
  }, [event])
}
