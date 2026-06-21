import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

const BASE = '/yolda-dispatcher'

// ============ DISPATCHERS ============
export const useYoldaDispatchers = (params?: { search?: string; isActive?: boolean }) =>
  useQuery({
    queryKey: ['yolda', 'dispatchers', params],
    queryFn: async () => {
      const r = await api.get(`${BASE}/admin/dispatchers`, { params })
      return r.data as any[]
    },
  })

export const useCreateYoldaDispatcher = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => (await api.post(`${BASE}/admin/dispatchers`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yolda', 'dispatchers'] }),
  })
}

export const useUpdateYoldaDispatcher = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => (await api.patch(`${BASE}/admin/dispatchers/${id}`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yolda', 'dispatchers'] }),
  })
}

export const useDeleteYoldaDispatcher = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`${BASE}/admin/dispatchers/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yolda', 'dispatchers'] }),
  })
}

// ============ GEOZONES ============
export const useYoldaGeoZones = () =>
  useQuery({
    queryKey: ['yolda', 'geozones'],
    queryFn: async () => (await api.get(`${BASE}/geozones`)).data as any[],
  })

export const useCreateYoldaGeoZone = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => (await api.post(`${BASE}/geozones`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yolda', 'geozones'] }),
  })
}

export const useUpdateYoldaGeoZone = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => (await api.patch(`${BASE}/geozones/${id}`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yolda', 'geozones'] }),
  })
}

export const useDeleteYoldaGeoZone = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`${BASE}/geozones/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yolda', 'geozones'] }),
  })
}

export const useAssignYoldaZone = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ zoneId, dispatcherId }: any) =>
      (await api.post(`${BASE}/geozones/${zoneId}/assign/${dispatcherId}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['yolda', 'geozones'] })
      qc.invalidateQueries({ queryKey: ['yolda', 'dispatchers'] })
    },
  })
}

export const useUnassignYoldaZone = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ zoneId, dispatcherId }: any) =>
      (await api.delete(`${BASE}/geozones/${zoneId}/assign/${dispatcherId}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['yolda', 'geozones'] })
      qc.invalidateQueries({ queryKey: ['yolda', 'dispatchers'] })
    },
  })
}

// ============ BLOCKLIST ============
export const useYoldaBlocklist = () =>
  useQuery({
    queryKey: ['yolda', 'blocklist'],
    queryFn: async () => (await api.get(`${BASE}/blocklist`)).data as any[],
  })

export const useAddYoldaBlocklist = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { phone: string; reason?: string }) =>
      (await api.post(`${BASE}/blocklist`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yolda', 'blocklist'] }),
  })
}

export const useRemoveYoldaBlocklist = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (phone: string) => (await api.delete(`${BASE}/blocklist/${encodeURIComponent(phone)}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yolda', 'blocklist'] }),
  })
}

// ============ CALLS ============
export const useYoldaCalls = (params: any = {}) =>
  useQuery({
    queryKey: ['yolda', 'calls', params],
    queryFn: async () => (await api.get(`${BASE}/calls/admin/list`, { params })).data,
  })

export const useYoldaCallStats = (params: any = {}) =>
  useQuery({
    queryKey: ['yolda', 'calls', 'stats', params],
    queryFn: async () => (await api.get(`${BASE}/calls/admin/stats`, { params })).data,
  })

// ============ REQUESTS ============
export const useYoldaRequests = (status?: string) =>
  useQuery({
    queryKey: ['yolda', 'requests', status],
    queryFn: async () => (await api.get(`${BASE}/requests/admin`, { params: { status } })).data,
  })

export const useResolveYoldaRequest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: any) =>
      (await api.patch(`${BASE}/requests/${id}/resolve`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yolda', 'requests'] }),
  })
}
