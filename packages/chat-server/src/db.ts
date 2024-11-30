import { Chat } from "@chat-multi/core"
import { Database } from "sqlite3"

const db = new Database("db.sqlite")

export async function getAllChat(): Promise<Chat[]> {
    return new Promise((res, rej) => {
        db.all<Chat>(`SELECT * FROM chats`, (err, rows) => {
            if (err) {
                rej(err)
            }
            else {
                res(rows)
            }
        })
    })
}

export async function getChatById(id: number): Promise<Chat> {
    return new Promise((res, rej) => {
        db.get<Chat>(`SELECT * FROM chats WHERE id = ?`, [ id ], (err, row) => {
            if (err) {
                rej(err)
            }
            else {
                res(row)
            }
        })
    })
}

export async function insertChat(chat: Chat): Promise<Chat> {
    return new Promise((res, rej) => {
        db.run(`
            INSERT INTO chats (userId, userName, messageType, message, image, replyChatId)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            chat.userId,
            chat.userName,
            chat.messageType,
            chat.message,
            chat.messageType === "image" ? chat.image : null,
            chat.replyChatId ?? null,
        ], function (err) {
            if (err) {
                rej(err)
            }
            else {
                res(getChatById(this.lastID))
            }
        })
    })
}