import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Space, Modal } from 'antd'
import styled from 'styled-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const AdsEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['ad', id],
    queryFn: async () => {
      const response = await api.get(`/ads/${id}`)
      return response.data
    },
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      await api.patch(`/ads/${id}`, values)
    },
    onSuccess: () => {
      message.success('E\'lon yangilandi!')
      queryClient.invalidateQueries({ queryKey: ['ad', id] })
      queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/ads/${id}`)
    },
    onSuccess: () => {
      message.success('E\'lon o\'chirildi!')
      navigate('/ads')
    },
  })

  const closeMutation = useMutation({
    mutationFn: async (data: { soldQuantity: number; reason: string }) => {
      await api.post(`/ads/${id}/close`, data)
    },
    onSuccess: () => {
      message.success('E\'lon yopildi!')
      queryClient.invalidateQueries({ queryKey: ['ad', id] })
      queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
  })

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data)
    }
  }, [data, form])

  const handleDelete = () => {
    Modal.confirm({
      title: 'E\'lonni o\'chirish',
      content: 'Rostdan ham shu e\'lonni o\'chirmoqchimiszmi?',
      okText: 'Ha',
      okType: 'danger',
      cancelText: 'Bekor qilish',
      onOk: () => deleteMutation.mutate(),
    })
  }

  const handleClose = () => {
    Modal.confirm({
      title: 'E\'lonni yopish',
      content: (
        <div>
          <p>Sotilgan soni:</p>
          <input
            type="number"
            id="close-quantity"
            style={{ width: '100%', padding: 8, marginTop: 8 }}
          />
          <p style={{ marginTop: 16 }}>Sabab:</p>
          <textarea
            id="close-reason"
            rows={3}
            style={{ width: '100%', padding: 8 }}
            placeholder="Sabab..."
          />
        </div>
      ),
      okText: 'Yopish',
      onOk: () => {
        const quantity = (document.getElementById('close-quantity') as HTMLInputElement)?.value
        const reason = (document.getElementById('close-reason') as HTMLTextAreaElement)?.value
        if (quantity) {
          closeMutation.mutate({ soldQuantity: parseInt(quantity), reason })
        }
      },
    })
  }

  if (isLoading) return <div>Yuklanmoqda...</div>

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <StyledCard title="E\'lon Tahrirlash">
          <Form form={form} layout="vertical" onFinish={(v) => updateMutation.mutate(v)}>
            <Form.Item label="Sarlavha" name="title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Tavsif" name="description">
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item label="Matn" name="content" rules={[{ required: true }]}>
              <Input.TextArea rows={8} />
            </Form.Item>

            <Form.Item label="Narx" name="price">
              <Input type="number" />
            </Form.Item>

            <Space>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Saqlash
              </Button>
              <Button onClick={handleClose} danger>
                Yopish
              </Button>
              <Button onClick={handleDelete} danger>
                O'chirish
              </Button>
            </Space>
          </Form>
        </StyledCard>
      </Space>
    </div>
  )
}

export default AdsEdit
