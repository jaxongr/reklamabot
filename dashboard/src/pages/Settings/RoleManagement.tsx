import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Switch,
  Tag,
  Space,
  message,
  Typography,
  Spin,
  Tooltip,
  Alert,
} from 'antd'
import { SaveOutlined, LockOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import api from '../../services/api'

const { Title, Text } = Typography

const PageWrapper = styled.div`
  padding: 24px;
`

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`

// Rollar — faqat sozlash mumkin bo'lganlar (SUPER_ADMIN/ADMIN avtomatik hamma narsa)
const ROLES = [
  { key: 'DISPATCHER', label: 'Dispetcher', color: 'blue' },
  { key: 'DRIVER', label: 'Haydovchi', color: 'green' },
  { key: 'USER', label: 'Foydalanuvchi', color: 'default' },
]

// Bo'limlar — har biri menyu elementiga mos keladi
const SECTIONS = [
  { key: 'orders', label: 'Buyurtmalar', desc: "Barcha buyurtmalar, qabul qilish, yuk topish" },
  { key: 'ads', label: "E'lonlar", desc: "E'lon yaratish va tahrirlash" },
  { key: 'posts', label: 'Tarqatish', desc: "E'lonlarni guruhlarga tarqatish" },
  { key: 'sessions', label: 'Sessiyalar', desc: 'Telegram sessiyalarini boshqarish' },
  { key: 'groups', label: 'Guruhlar', desc: 'Telegram guruhlarini ko\'rish' },
  { key: 'monitor', label: 'Monitoring', desc: 'Kuzatuv va bloklangan foydalanuvchilar' },
  { key: 'drivers', label: 'Haydovchilar', desc: 'Haydovchi profillarini boshqarish' },
  { key: 'locations', label: 'Lokatsiyalar', desc: 'Shahar va manzillar' },
  { key: 'users', label: 'Foydalanuvchilar', desc: 'Foydalanuvchilar ro\'yxati va to\'lovlar' },
  { key: 'payments', label: "To'lovlar", desc: 'To\'lov tarixi va boshqaruv' },
  { key: 'analytics', label: 'Statistika', desc: 'Barcha analitika va hisobotlar' },
  { key: 'chat', label: 'Chat', desc: 'Chat xonalari' },
  { key: 'support', label: "Qo'llab-quvvatlash", desc: 'Murojaat va javoblar' },
  { key: 'notifications', label: 'Bildirishnomalar', desc: 'Push bildirishnomalar' },
  { key: 'sms', label: 'SMS', desc: 'SMS xizmatini boshqarish' },
  { key: 'settings', label: 'Sozlamalar', desc: 'Tizim sozlamalari va hodimlar' },
]

// Matritsa: section → role → boolean
type Matrix = Record<string, Record<string, boolean>>

function initMatrix(): Matrix {
  const m: Matrix = {}
  for (const s of SECTIONS) {
    m[s.key] = {}
    for (const r of ROLES) {
      m[s.key][r.key] = false
    }
  }
  return m
}

export default function RoleManagement() {
  const [matrix, setMatrix] = useState<Matrix>(initMatrix)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // API'dan ruxsatlarni olish
  useEffect(() => {
    api.get('/auth/permissions')
      .then(res => {
        const data = res.data
        const m = initMatrix()
        // Backend format: { DISPATCHER: { orders: ['VIEW','CREATE'], ... }, ... }
        if (data && typeof data === 'object') {
          for (const [role, sections] of Object.entries(data)) {
            if (typeof sections === 'object' && sections !== null) {
              for (const section of Object.keys(sections as object)) {
                if (m[section] && m[section][role] !== undefined) {
                  m[section][role] = true
                }
              }
            }
          }
        }
        setMatrix(m)
      })
      .catch(() => message.error('Ruxsatlarni yuklashda xato'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = (section: string, role: string, checked: boolean) => {
    setMatrix(prev => ({
      ...prev,
      [section]: { ...prev[section], [role]: checked },
    }))
    setIsDirty(true)
  }

  const handleToggleAll = (role: string, checked: boolean) => {
    setMatrix(prev => {
      const next = { ...prev }
      for (const s of SECTIONS) {
        next[s.key] = { ...next[s.key], [role]: checked }
      }
      return next
    })
    setIsDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Har bir rol uchun alohida saqlash
      for (const role of ROLES) {
        const permissions: Array<{ section: string; action: string; enabled: boolean }> = []
        for (const s of SECTIONS) {
          const enabled = !!matrix[s.key]?.[role.key]
          // VIEW action — bo'limni ko'rish uchun
          permissions.push({ section: s.key, action: 'VIEW', enabled })
          permissions.push({ section: s.key, action: 'CREATE', enabled })
          permissions.push({ section: s.key, action: 'EDIT', enabled })
          permissions.push({ section: s.key, action: 'DELETE', enabled })
          permissions.push({ section: s.key, action: 'EXPORT', enabled })
          permissions.push({ section: s.key, action: 'MANAGE', enabled })
        }
        await api.put('/auth/permissions', { role: role.key, permissions })
      }
      message.success('Ruxsatlar saqlandi')
      setIsDirty(false)
    } catch {
      message.error('Saqlashda xato')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageWrapper><div style={{ textAlign: 'center', padding: 64 }}><Spin size="large" /></div></PageWrapper>
  }

  const columns: any[] = [
    {
      title: "Bo'lim",
      key: 'section',
      width: 250,
      fixed: 'left' as const,
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.label}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.desc}</Text>
        </div>
      ),
    },
    ...ROLES.map(role => ({
      title: (
        <Space direction="vertical" size={4} style={{ textAlign: 'center' }}>
          <Tag color={role.color} style={{ fontWeight: 600 }}>{role.label}</Tag>
          <Tooltip title={`${role.label} — hammasini yoqish/o'chirish`}>
            <Switch
              size="small"
              checked={SECTIONS.every(s => matrix[s.key]?.[role.key])}
              onChange={(checked) => handleToggleAll(role.key, checked)}
            />
          </Tooltip>
        </Space>
      ),
      key: role.key,
      width: 130,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Switch
          checked={!!matrix[record.key]?.[role.key]}
          onChange={(checked) => handleToggle(record.key, role.key, checked)}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      ),
    })),
  ]

  return (
    <PageWrapper>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <LockOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0 }}>Rol boshqaruvi</Title>
        </Space>
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          disabled={!isDirty}
        >
          {isDirty ? "Saqlash" : "Saqlangan"}
        </Button>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Super Admin va Admin avtomatik barcha bo'limlarga ruxsatga ega. Quyida faqat Dispetcher, Haydovchi va Foydalanuvchi rollarini sozlang."
      />

      <StyledCard>
        <Table
          columns={columns}
          dataSource={SECTIONS}
          rowKey="key"
          pagination={false}
          scroll={{ x: 700 }}
          size="middle"
          bordered
        />
      </StyledCard>
    </PageWrapper>
  )
}
