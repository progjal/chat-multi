type MessageText = {
    messageType: "text"
    message: string
}

type MessageImage = {
    messageType: "image"
    image: string
    message: string
}

type MessageDetail = MessageText | MessageImage

export type Chat = {
    id: number
    userId: number
    userName: string
    date: Date
    replyChatId?: number
} & MessageDetail