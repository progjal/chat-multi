<script setup lang="ts">

import { onMounted } from 'vue';
import { ref } from 'vue';
import Reply from "@/icon/Reply.vue"
import { type Chat, socket } from "@chat-multi/core"

const selfId = 2

const chats = ref<Chat[]>([])

const text = ref("")
const repliedChat = ref<Chat | null>(null)
const curImage = ref<string | null>(null)

function send() {
    let newChat: Chat
    
    if (curImage.value) {
        newChat = {
            id: 0,
            userId: selfId,
            userName: "Si Vue",
            messageType: "image",
            image: curImage.value,
            message: text.value,
            date: new Date(),
            replyChatId: repliedChat.value?.id,
        }
    }
    else {
        newChat = {
            id: 0,
            userId: selfId,
            userName: "Si Vue",
            messageType: "text",
            message: text.value,
            date: new Date(),
            replyChatId: repliedChat.value?.id,
        }
    }
    
    socket.emit('chat', newChat)
    
    text.value = ""
    curImage.value = null
    repliedChat.value = null
}

function reply(chat: Chat) {
    repliedChat.value = chat
}

function cancelReply() {
    repliedChat.value = null
}

function getChatById(id: number): Chat | undefined {
    return chats.value.find(x => x.id === id)
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

function onDrop(e: DragEvent) {
    const file = e.dataTransfer?.files?.[0]
    e.preventDefault()
    
    if (file) {
        readImageFromFile(file)
            .then(r => {
                curImage.value = r?.toString() ?? null
            })
    }
    
}

function cancelImage() {
    curImage.value = null
}

onMounted(() => {
    socket.on('init-chats', (initChats: Chat[]) => {
        chats.value = initChats
    })
    
    socket.on('chat', (chat: Chat) => {
        chats.value.push(chat)
    })
})

</script>

<template>
    <div
        class="bg-gray-200 flex flex-col"
        @dragover="e => e.preventDefault()"
        @drop="onDrop"
    >
        <div class="flex-1 p-4 flex flex-col">
            <div
                v-if="curImage"
                class="flex items-center justify-center relative p-4"
            >
                <img
                    alt="img"
                    :src="curImage"
                />
                
                <button
                    class="absolute right-3 top-1 text-gray-500 text-lg"
                    onclick={cancelImage}
                >x</button>
            </div>
            <template v-else v-for="chat in chats">
                <div
                    v-if="chat.userId === selfId"
                    class="bg-emerald-300 my-1 p-3 rounded-lg flex flex-col self-end ml-8 group relative"
                >
                    <span class="text-sm text-gray-700">Kamu</span>
                    <div v-if="chat.replyChatId" class="bg-white/30 px-2 py-1 text-sm my-1">
                        {{ getChatById(chat.replyChatId)?.message }}
                    </div>
                    <img
                        v-if="chat.messageType === 'image'"
                        class="max-w-48"
                        alt="img"
                        :src="chat.image"
                    />
                    <span>{{ chat.message }}</span>
                
                    <button
                        class="absolute right-2 top-2 hidden group-hover:block"
                        @click="reply(chat)"
                    >
                        <Reply class="w-4 h-4" color="#666666"/>
                    </button>
                </div>
                <div
                    v-else
                    class="bg-white my-1 p-3 rounded-lg flex flex-col self-start mr-8 group relative"
                >
                    <span class="text-sm text-gray-700">{{ chat.userName }}</span>
                    <div v-if="chat.replyChatId" class="bg-black/10 px-2 py-1 text-sm my-1">
                        {{ getChatById(chat.replyChatId)?.message }}
                    </div>
                    <img
                        v-if="chat.messageType === 'image'"
                        class="max-w-48"
                        alt="img"
                        :src="chat.image"
                    />
                    <span>{{ chat.message }}</span>
                
                    <button
                        class="absolute right-2 top-2 hidden group-hover:block"
                        @click="reply(chat)"
                    >
                        <Reply class="w-4 h-4" color="#BBBBBB"/>
                    </button>
                </div>
            </template>
        </div>
        <div>
            <div v-if="repliedChat" class="p-3 bg-black/10 flex flex-col rounded-t-lg relative">
                <span class="text-xs">{{ repliedChat.userName }}</span>
                <span class="text-sm">{{ repliedChat.message }}</span>
                
                <button
                    class="absolute right-3 top-1 text-gray-500"
                    @click="cancelReply"
                >x</button>
            </div>
            <div class="flex">
                <input
                    class="flex-1 p-2 outline-none"
                    type="text"
                    v-model="text"
                />
                
                <button
                    @click="send"
                    class="bg-blue-500 px-3 text-white"
                >
                    Send
                </button>
            </div>
        </div>
    </div>
</template>
