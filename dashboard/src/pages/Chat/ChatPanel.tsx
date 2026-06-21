import { useState, useRef, useEffect } from 'react'
import {
  Input,
  Button,
  Typography,
  Space,
  Avatar,
  Tag,
  Spin,
  message,
  Badge,
  Empty,
} from 'antd'
import { SendOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useAllChatRooms, useChatMessages, useSendChatMessage } from '../../hooks/useApi'
import type { ChatRoom, ChatMessage, ChatRoomType } from '../../types'

const { Text, Title } = Typography
const { TextArea } = Input

const PageWrapper = styled.div`
  padding: 24px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
`

const PageHeader = styled.div`
  margin-bottom: 16px;
`

const ChatLayout = styled.div`
  display: flex;
  flex: 1;
  gap: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 0;
`

const RoomList = styled.div`
  width: 30%;
  min-width: 240px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const RoomListHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  font-size: 14px;
  color: #333;
`

const RoomListScroll = styled.div`
  flex: 1;
  overflow-y: auto;
`

const RoomItem = styled.div<{ $active?: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  border-left: 3px solid ${({ $active }) => ($active ? '#FC3F1D' : 'transparent')};
  background: ${({ $active }) => ($active ? '#fff5f3' : 'transparent')};
  transition: background 0.15s;

  &:hover {
    background: ${({ $active }) => ($active ? '#fff5f3' : '#fafafa')};
  }
`

const RoomItemName = styled.div`
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RoomItemPreview = styled.div`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  min-width: 0;
`

const ChatHeader = styled.div`
  padding: 14px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
`

const MessagesScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const MessageBubble = styled.div<{ $isStaff?: boolean }>`
  display: flex;
  flex-direction: ${({ $isStaff }) => ($isStaff ? 'row-reverse' : 'row')};
  gap: 10px;
  align-items: flex-end;
`

const BubbleContent = styled.div<{ $isStaff?: boolean }>`
  max-width: 68%;
  padding: 10px 14px;
  border-radius: ${({ $isStaff }) =>
    $isStaff ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${({ $isStaff }) => ($isStaff ? '#FC3F1D' : '#fff')};
  color: ${({ $isStaff }) => ($isStaff ? '#fff' : '#333')};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  word-break: break-word;
`

const BubbleMeta = styled.div`
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
`

const InputArea = styled.div`
  padding: 14px 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
  align-items: flex-end;
`

const EmptyChat = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
`

const RoomTypeTagMap: Record<ChatRoomType, { color: string; label: string }> = {
  DISPATCHER_SUPPORT: { color: 'orange', label: 'Dispetcher' },
  DRIVER_SUPPORT: { color: 'green', label: 'Haydovchi' },
  DISPATCHER_GROUP: { color: 'blue', label: 'Guruh' },
  DRIVER_GROUP: { color: 'purple', label: 'Haydovchi guruhi' },
}

function getRoomDisplayName(room: ChatRoom): string {
  if (room.name) return room.name
  const participant = room.participants?.[0]?.user
  if (participant) {
    return (participant.firstName || participant.username || 'Noma\'lum foydalanuvchi').slice(0, 15)
  }
  return `Xona #${room.id.slice(-6)}`
}

function getLastMessage(room: ChatRoom): string {
  const msgs = room.messages
  if (!msgs || msgs.length === 0) return 'Xabarlar yo\'q'
  const last = msgs[msgs.length - 1]
  return last.message.length > 40 ? last.message.slice(0, 40) + '…' : last.message
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

export default function ChatPanel() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: roomsData, isLoading: roomsLoading } = useAllChatRooms({ limit: 50 })
  const { data: messagesData, isLoading: messagesLoading } = useChatMessages(selectedRoomId, { limit: 100 })
  const sendMessage = useSendChatMessage()

  const rooms = roomsData?.data ?? []
  const messages = messagesData?.data ?? []

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || !selectedRoomId) return
    try {
      await sendMessage.mutateAsync({ roomId: selectedRoomId, message: text })
      setInputValue('')
    } catch {
      message.error('Xabar yuborishda xato')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <PageWrapper>
      <PageHeader>
        <Title level={3} style={{ margin: 0 }}>
          Chat paneli
        </Title>
      </PageHeader>

      <ChatLayout>
        {/* Room List */}
        <RoomList>
          <RoomListHeader>
            <Space>
              <MessageOutlined />
              Suhbatlar ({rooms.length})
            </Space>
          </RoomListHeader>
          <RoomListScroll>
            {roomsLoading ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin />
              </div>
            ) : rooms.length === 0 ? (
              <div style={{ padding: 24 }}>
                <Empty description="Suhbatlar topilmadi" imageStyle={{ height: 40 }} />
              </div>
            ) : (
              rooms.map((room) => {
                const typeInfo = RoomTypeTagMap[room.type]
                const msgCount = room._count?.messages ?? 0
                return (
                  <RoomItem
                    key={room.id}
                    $active={room.id === selectedRoomId}
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <RoomItemName>{getRoomDisplayName(room)}</RoomItemName>
                      {msgCount > 0 && (
                        <Badge count={msgCount} overflowCount={99} style={{ fontSize: 10 }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <RoomItemPreview>{getLastMessage(room)}</RoomItemPreview>
                      <Tag color={typeInfo?.color} style={{ fontSize: 10, lineHeight: '16px', marginLeft: 4 }}>
                        {typeInfo?.label ?? room.type}
                      </Tag>
                    </div>
                  </RoomItem>
                )
              })
            )}
          </RoomListScroll>
        </RoomList>

        {/* Chat Area */}
        {selectedRoom ? (
          <ChatArea>
            <ChatHeader>
              <Avatar icon={<UserOutlined />} style={{ background: '#FC3F1D' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{getRoomDisplayName(selectedRoom)}</div>
                <Tag color={RoomTypeTagMap[selectedRoom.type]?.color} style={{ fontSize: 11 }}>
                  {RoomTypeTagMap[selectedRoom.type]?.label ?? selectedRoom.type}
                </Tag>
              </div>
            </ChatHeader>

            <MessagesScroll>
              {messagesLoading ? (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <Spin />
                </div>
              ) : messages.length === 0 ? (
                <Empty description="Xabarlar yo'q" />
              ) : (
                messages.map((msg: ChatMessage) => {
                  const isStaff = msg.sender?.role === 'ADMIN' || msg.sender?.role === 'SUPER_ADMIN'
                  const senderName =
                    (msg.sender?.firstName || msg.sender?.username || 'Noma\'lum').slice(0, 15)
                  return (
                    <MessageBubble key={msg.id} $isStaff={isStaff}>
                      {!isStaff && (
                        <Avatar size="small" icon={<UserOutlined />} style={{ flexShrink: 0 }} />
                      )}
                      <div>
                        {!isStaff && (
                          <Text type="secondary" style={{ fontSize: 12, marginBottom: 2, display: 'block' }}>
                            {senderName}
                          </Text>
                        )}
                        <BubbleContent $isStaff={isStaff}>
                          {msg.message}
                        </BubbleContent>
                        <BubbleMeta style={{ textAlign: isStaff ? 'right' : 'left' }}>
                          {formatTime(msg.createdAt)}
                        </BubbleMeta>
                      </div>
                    </MessageBubble>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </MessagesScroll>

            <InputArea>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Xabar yozing... (Enter — yuborish)"
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{ flex: 1, borderRadius: 8 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={sendMessage.isPending}
                disabled={!inputValue.trim()}
                style={{ borderRadius: 8, height: 40 }}
              >
                Yuborish
              </Button>
            </InputArea>
          </ChatArea>
        ) : (
          <EmptyChat>
            <Empty
              image={<MessageOutlined style={{ fontSize: 64, color: '#ddd' }} />}
              description={
                <Text type="secondary">Suhbat tanlang</Text>
              }
            />
          </EmptyChat>
        )}
      </ChatLayout>
    </PageWrapper>
  )
}
