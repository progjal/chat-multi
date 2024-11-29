<script setup lang="ts">

import { onMounted } from 'vue';
import { ref } from 'vue';
import Reply from "@/icon/Reply.vue"
import { type Chat, socket } from "@chat-multi/core"

const selfId = 2

const chats = ref<Chat[]>([])

const text = ref("")
let repliedChat = ref<Chat | null>(null)

function send() {
    socket.emit('chat', {
        id: 0,
        userId: 2,
        userName: "Si Vue",
        message: text.value,
        date: new Date(),
        replyChatId: repliedChat.value?.id,
    } satisfies Chat)
    
    text.value = ""
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
    <div class="bg-gray-200 h-full flex flex-col">
        <div class="flex-1 p-4 flex flex-col">
            <template v-for="chat in chats">
                <div
                    v-if="chat.userId === selfId"
                    class="bg-emerald-300 my-1 p-3 rounded-lg flex flex-col self-end ml-8 group relative"
                >
                    <span class="text-sm text-gray-700">Kamu</span>
                    <div v-if="chat.replyChatId" class="bg-white/30 px-2 py-1 text-sm my-1">
                        {{ getChatById(chat.replyChatId)?.message }}
                    </div>
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
