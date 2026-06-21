import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('sms_token')
  if (t) cfg.headers['x-admin-token'] = t
  return cfg
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('sms_token')
      if (location.pathname !== '/login') location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export const isLoggedIn = () => !!localStorage.getItem('sms_token')

export async function login(password) {
  const { data } = await api.post('/login', { password })
  localStorage.setItem('sms_token', data.token)
  return data
}

export function logout() {
  localStorage.removeItem('sms_token')
  location.href = '/login'
}

export default api
