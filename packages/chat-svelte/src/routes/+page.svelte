<script lang="ts">

import { socket, type Chat } from "@chat-multi/core"
import { onMount } from "svelte";
import Reply from "../icons/reply.svelte"

const selfId = 3

let chats = $state<Chat[]>([])
let text = $state("")
let repliedChat = $state<Chat | null>(null)
let curImage = $state<string | null>(null)

function send() {
    let newChat: Chat
    
    if (curImage) {
        newChat = {
            id: 0,
            userId: 3,
            userName: "Si Svelte",
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
            userId: 3,
            userName: "Si Svelte",
            messageType: "text",
            message: text,
            date: new Date(),
            replyChatId: repliedChat?.id,
        }
    }
    
    socket.emit('chat', newChat)
    
    text = ""
    curImage = null
    repliedChat = null
}

function reply(chat: Chat) {
    repliedChat = chat
}

function cancelReply() {
    repliedChat = null
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

function onDrop(e: DragEvent) {
    const file = e.dataTransfer?.files?.[0]
    e.preventDefault()
    
    if (file) {
        readImageFromFile(file)
            .then(r => {
                curImage = r?.toString() ?? null
            })
    }
    
}

function cancelImage() {
    curImage = null
}

onMount(() => {
    socket.emit('get-chats', (initChats: Chat[]) => {
        chats = initChats
    })
    
    socket.on('chat', (chat: Chat) => {
        chats.push(chat)
    })
})

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div
    class="flex flex-col bg-gray-200"
    ondragover={e => e.preventDefault()}
    ondrop={onDrop}
>
    {#if curImage}
    <div class="flex items-center justify-center relative p-4">
        <img
            alt="img"
            src={curImage}
        />
        
        <button
            class="absolute right-3 top-1 text-gray-500 text-lg"
            onclick={cancelImage}
        >x</button>
    </div>
    {:else}
    <div class="flex-1 p-4 flex flex-col">
        {#each chats as chat}
            {#if chat.userId === selfId}
            <div class="bg-orange-300 my-1 p-3 rounded-lg flex flex-col self-end ml-8 relative group">
                <span class="text-sm text-gray-700 mr-6">Kamu</span>
                {#if chat.replyChatId}
                <div class="bg-white/30 px-2 py-1 text-sm my-1">
                    { getChatById(chat.replyChatId)?.message }
                </div>
                {/if}
                {#if chat.messageType === "image"}
                <img
                    class="max-w-48"
                    alt="img"
                    src={chat.image}
                />
                {/if}
                <span>{ chat.message }</span>
                
                <button
                    class="absolute right-2 top-2 hidden group-hover:block"
                    onclick={() => reply(chat)}
                >
                    <Reply class="w-4 h-4" color="#666666"/>
                </button>
            </div>
            {:else}
            <div class="bg-white my-1 p-3 rounded-lg flex flex-col self-start mr-8 relative group">
                <span class="text-sm text-gray-700 mr-6">{ chat.userName }</span>
                {#if chat.replyChatId}
                <div class="bg-black/10 px-2 py-1 text-sm my-1">
                    { getChatById(chat.replyChatId)?.message }
                </div>
                {/if}
                {#if chat.messageType === "image"}
                <img
                    class="max-w-48"
                    alt="img"
                    src={chat.image}
                />
                {/if}
                <span>{ chat.message }</span>
                
                <button
                    class="absolute right-2 top-2 hidden group-hover:block"
                    onclick={() => reply(chat)}
                >
                    <Reply class="w-4 h-4" color="#BBBBBB"/>
                </button>
            </div>
            {/if}
        
        {/each}
    </div>
    {/if}
    <div>
        {#if repliedChat}
        <div class="p-3 bg-black/10 flex flex-col rounded-t-lg relative">
            <span class="text-xs">{repliedChat.userName}</span>
            <span class="text-sm">{repliedChat.message}</span>
            
            <button
                class="absolute right-3 top-1 text-gray-500"
                onclick={cancelReply}
            >x</button>
        </div>
        {/if}
        <div class="flex">
            <input
                class="flex-1 p-2 outline-none"
                type="text"
                bind:value={text}
            />
            
            <button
                onclick={send}
                class="bg-blue-500 px-3 text-white"
            >
                Send
            </button>
        </div>
    </div>
</div>