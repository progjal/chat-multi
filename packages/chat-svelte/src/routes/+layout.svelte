<script lang="ts">

import "../app.css";
import { socket } from "@chat-multi/core";
import { onDestroy, onMount } from "svelte";

function onMessage(msg: string) {
    console.log(`Message : "${msg}"`)
}

onMount(() => {
    socket.on('message', onMessage)
})

onDestroy(() => {
    socket.off('message', onMessage)
})

</script>

<slot />