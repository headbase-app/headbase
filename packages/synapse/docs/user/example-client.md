

```js
class RelayClient {
    socket: WebSocket
    isAlive: boolean

    constructor() {
        this.isAlive = true
        this.relay = new WebSocket("ws://relay.example.com/v1?rid=test1&pid=peer1", ["admin-secret"])
    }
}


const relay = new WebSocket("ws://relay.example.com/v1?rid=test1&pid=peer1", ["admin-secret"])
relay.isAlive = true;
relay.onopen = (e) => {console.log(e)}
relay.onerror = (e) => {console.log(e)}
relay.onmessage = (e) => {
    e.target.isAlive = true;
    if (e.data === "ping") {
        console.log("[message] received ping, sending pong")
        return relay.send("pong")
    }

    console.log("[message]", e.data)
}
const heartbeat = setInterval(() => {
    if (!relay.isAlive) {
        return relay.close()
    }

    relay.isAlive = false;
    relay.send("ping")
}, 20000)
relay.onclose = (e) => {
    clearInterval(heartbeat)
    console.log(e)
}
```