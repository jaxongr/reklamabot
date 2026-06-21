import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import uzUZ from 'antd/locale/uz_UZ'
import App from './App.jsx'
import 'antd/dist/reset.css'

const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#16A34A',
    colorError: '#EF4444',
    colorWarning: '#F59E0B',
    borderRadius: 8,
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme} locale={uzUZ}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)
