import { useEffect, useState } from 'react'
import { Card, Table, Button, Tag, Segmented, Tooltip } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import api from '../api'

export default function Logs() {
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [status, setStatus] = useState('all')

  const load = async (p = page, ps = pageSize, st = status) => {
    setLoading(true)
    try {
      const q = st && st !== 'all' ? `&status=${st}` : ''
      const { data } = await api.get(`/sms/logs?limit=${ps}&offset=${(p - 1) * ps}${q}`)
      setList(data.rows || [])
      setTotal(data.total || 0)
    } catch (e) {} finally { setLoading(false) }
  }
  useEffect(() => { load(1, pageSize, status) }, [])

  const onFilter = (st) => { setStatus(st); setPage(1); load(1, pageSize, st) }

  const columns = [
    { title: '#', render: (_, __, i) => (page - 1) * pageSize + i + 1, width: 60 },
    { title: 'Raqam', dataIndex: 'phone', width: 150 },
    {
      title: 'Holat', dataIndex: 'status', width: 110,
      render: (s) => (s === 'sent' ? <Tag color="green">✓ yuborildi</Tag> : <Tag color="red">✗ xato</Tag>),
    },
    {
      title: 'Matn / Xato', render: (_, r) => (
        r.status === 'sent'
          ? <Tooltip title={r.message}><span style={{ color: '#00000073' }}>{(r.message || '').slice(0, 60)}{(r.message || '').length > 60 ? '…' : ''}</span></Tooltip>
          : <span style={{ color: '#cf1322' }}>{r.error}</span>
      ),
    },
    { title: 'Vaqt', dataIndex: 'sent_at', width: 180, render: (d) => new Date(d).toLocaleString('uz-UZ') },
  ]

  return (
    <Card
      title={`📜 SMS loglari (jami: ${total})`}
      extra={
        <span>
          <Segmented
            value={status}
            onChange={onFilter}
            options={[{ label: 'Hammasi', value: 'all' }, { label: 'Yuborilgan', value: 'sent' }, { label: 'Xato', value: 'failed' }]}
            style={{ marginRight: 12 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => load()}>Yangilash</Button>
        </span>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        size="middle"
        locale={{ emptyText: 'Hali SMS yuborilmagan' }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['20', '50', '100', '200'],
          showTotal: (t, r) => `${r[0]}-${r[1]} / ${t} ta`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); load(p, ps, status) },
        }}
      />
    </Card>
  )
}
