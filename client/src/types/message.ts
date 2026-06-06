export type Message  ={
  id: string
  senderId: string
  senderUsername: string
  senderImageUrl?: string | null
  recipientId: string
  recipientUsername: string
  recipientImageUrl?: string | null
  content: string
  dateRead?: string | null
  messageSent?: string | null
  currentUserSender?: boolean
}
