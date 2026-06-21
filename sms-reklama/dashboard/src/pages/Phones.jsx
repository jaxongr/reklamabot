import { useEffect, useState } from 'react'
import { Card, Table, Button, Tag } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import api from '../api'

export default function Phones() {
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const load = async (p = page, ps = pageSize) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/phones?limit=${ps}&offset=${(p - 1) * ps}`)
      setList(data.rows || [])
      setTotal(data.total || 0)
    } catch (e) {} finally { setLoading(false) }
  }
  useEffect(() => { load(1, pageSize) }, [])

  const columns = [
    { title: '#', render: (_, __, i) => (page - 1) * pageSize + i + 1, width: 64 },
    { title: 'Raqam', dataIndex: 'phone' },
    { title: 'Guruh', dataIndex: 'source_group', ellipsis: true },
    { title: 'SMS', dataIndex: 'sms_sent', width: 130, render: (v) => (v ? <Tag color="green">✓ yuborilgan</Tag> : <Tag>kutilmoqda</Tag>) },
    { title: 'Oxirgi SMS', dataIndex: 'sms_sent_at', width: 170, render: (d) => (d ? new Date(d).toLocaleString('uz-UZ') : '—') },
    { title: 'Topilgan', dataIndex: 'created_at', width: 170, render: (d) => new Date(d).toLocaleString('uz-UZ') },
  ]

  return (
    <Card
      title={`📞 Yig'ilgan raqamlar (jami: ${total})`}
      extra={<Button icon={<ReloadOutlined />} onClick={() => load()}>Yangilash</Button>}
    >
      <Table
        rowKey="phone"
        columns={columns}
        dataSource={list}
        loading={loading}
        size="middle"
        locale={{ emptyText: 'Hali raqam yig\'ilmagan' }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['20', '50', '100', '200', '500'],
          showTotal: (t, r) => `${r[0]}-${r[1]} / ${t} ta`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); load(p, ps) },
        }}
      />
    </Card>
  )
}
