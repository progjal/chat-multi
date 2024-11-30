'use client'

import { type Chat, socket } from "@chat-multi/core"
import { ReplyIcon } from "@/icons";
import { DragEvent, useEffect, useState } from "react";

const selfId = 1

export default function Home() {
    const [chats, setChats] = useState<Chat[]>([])
    const [text, setText] = useState("")
    const [curImage, setCurImage] = useState<string | null>(null)
    const [repliedChat, setRepliedChat] = useState<Chat | null>(null)
    
    function send() {
        let newChat: Chat
    
        if (curImage) {
            newChat = {
                id: 0,
                userId: selfId,
                userName: "Si React",
                messageType: "image",
                image: curImage,
                message: text,
                date: new Date(),
                replyChatId: repliedChat?.id,
            }
        }
        else {
            newChat = {
                id: 0,
                userId: selfId,
                userName: "Si React",
                messageType: "text",
                message: text,
                date: new Date(),
                replyChatId: repliedChat?.id,
            }
        }
        
        socket.emit('chat', newChat)
        
        setText("")
        setCurImage(null)
        setRepliedChat(null)
    }
    
    function reply(chat: Chat) {
        setRepliedChat(chat)
    }

    function cancelReply() {
        setRepliedChat(null)
    }

    function getChatById(id: number): Chat | undefined {
        return chats.find(x => x.id === id)
    }
    
    async function readImageFromFile(file: File): Promise<string | ArrayBuffer | null> {
        return new Promise((res) => {
            const reader = new FileReader()
            
            reader.onload = function() {
                res(reader.result)
            }
            
            reader.readAsDataURL(file)
        })
    }
    
    function onDrop(e: DragEvent<HTMLDivElement>) {
        const file = e.dataTransfer?.files?.[0]
        e.preventDefault()
        
        if (file) {
            readImageFromFile(file)
                .then(r => {
                    setCurImage(r?.toString() ?? null)
                })
        }
        
    }
    
    function cancelImage() {
        setCurImage(null)
    }
    
    useEffect(() => {
        socket.emit('get-chats', (chats: Chat[]) => {
            setChats(chats)
        })
        
        socket.on('chat', (chat: Chat) => {
            setChats((chats) => [
                ...chats,
                chat,
            ])
        })
    }, [])
    
    return <div
        className="bg-gray-200 flex flex-col"
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
    >
        {curImage ? (
            <div className="flex items-center justify-center relative p-4">
                <img
                    alt="img"
                    src={curImage}
                />
                
                <button
                    className="absolute right-3 top-1 text-gray-500 text-lg"
                    onClick={cancelImage}
                >x</button>
            </div>
        ) : (
            <div className="flex-1 p-4 flex flex-col">
                {chats.map((chat, index) => (
                    chat.userId === selfId ? (
                        <div
                            key={index}
                            className="bg-blue-300 my-1 p-3 rounded-lg flex flex-col self-end ml-8 group relative"
                        >
                            <span className="text-sm text-gray-700 mr-6">Kamu</span>
                            { chat.replyChatId ? (
                                <div className="bg-white/30 px-2 py-1 text-sm my-1">
                                    { getChatById(chat.replyChatId)?.message }
                                </div>
                            ) : null }
                            
                            { chat.messageType === "image" ? (
                                <img
                                    className="max-w-48"
                                    alt="img"
                                    src={chat.image}
                                />
                            ) : undefined}
                            
                            <span>{ chat.message }</span>
                    
                            <button
                                className="absolute right-2 top-2 hidden group-hover:block"
                                onClick={() => reply(chat)}
                            >
                                <ReplyIcon className="w-4 h-4" color="#666666"/>
                            </button>
                        </div>
                    ) : (
                        <div
                            key={index}
                            className="bg-white my-1 p-3 rounded-lg flex flex-col self-start mr-8 group relative"
                        >
                            <span className="text-sm text-gray-700 mr-6">{ chat.userName }</span>
                            { chat.replyChatId ? (
                                <div className="bg-black/10 px-2 py-1 text-sm my-1">
                                    { getChatById(chat.replyChatId)?.message }
                                </div>
                            ) : null }
                            
                            { chat.messageType === "image" ? (
                                <img
                                    className="max-w-48"
                                    alt="img"
                                    src={chat.image}
                                />
                            ) : undefined}
                            
                            <span>{ chat.message }</span>
                    
                            <button
                                className="absolute right-2 top-2 hidden group-hover:block"
                                onClick={() => reply(chat)}
                            >
                                <ReplyIcon className="w-4 h-4" color="#BBBBBB"/>
                            </button>
                        </div>
                    )
                ))}
            </div>
        )}
        
        <div>
            {repliedChat ? (
                <div className="p-3 bg-black/10 flex flex-col rounded-t-lg relative">
                    <span className="text-xs">{ repliedChat.userName }</span>
                    <span className="text-sm">{ repliedChat.message }</span>
                    
                    <button
                        className="absolute right-3 top-1 text-gray-500"
                        onClick={cancelReply}
                    >x</button>
                </div>
            ) : null}
            
            <div className="flex">
                <input
                    className="flex-1 p-2 outline-none"
                    type="text"
                    value={text}
                    onChange={(v) => setText(v.target.value)}
                />
                
                <button
                    onClick={send}
                    className="bg-blue-500 px-3 text-white"
                >
                    Send
                </button>
            </div>
        </div>
    </div>
}
