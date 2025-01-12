# Sync Websocket Reference
The sync websocket server allows devices to subscribe to real-time changes made by other devices (and the server).  
It is used as a read-only event emitter, meaning that devices can only use the websocket to receive updates when changes occurs but
the HTTP API is used to actually make those updates.

## Authentication

### Establishing a connection
You must request a connection ticket from `/v1/sync/ticket [GET]` in order to access the websocket.  
This endpoint is only available to authenticated users and will return the following JSON data:
```json5
{
  ticket: "<your ticket here>"
}
```

This ticket is valid for 15 seconds and **can be used once** to establish a websocket connection to `/v1/sync`.  
It should be passed within the `Sec-WebSocket-Protocol` header in the format `localful.ticket.<your-ticket-here` when making the connection,
for example `Sec-WebSocket-Protocol: localful.ticket.<your-ticket-here>`.  
Here is an example of this in Javascript:

```js
const ws = new WebSocket("ws://localhost:42102/v1/sync", ["localful.ticket.<your-ticket-here>"])
```

During the upgrade to websockets the server will ensure you have a valid ticket and that the `Origin` header
of your request matches an allowed origin.

### Connection refresh and expiry
The connection ticket allows the websocket connection to be opened, but you are still required to re-authenticate at regular
intervals (15 mins by default) just like you are with the HTTP API.  
When the server decides that the connection needs to be renewed, it will send the `refresh-ticket` event. The client then has 15 seconds
to request a new ticket (from `/v1/sync/ticket [GET]`) and then send a `ticket` event to the server, for example:

**Server requests connection refresh:**
```json5
{
  type: "refresh-ticket",
}
```

**Client sends new ticket:**
```json5
{
  messageId: "2949599a-ee31-4fca-a731-fc0375e52e5c",
  type: "ticket",
  data: {
    ticket: "<your-ticket-here>"
  }
}
```

**Server acknowledges that client request has been handled (or may send `error` message):**
```json5
{
  type: "ack",
  data: {
    messageId: "2949599a-ee31-4fca-a731-fc0375e52e5c"
  }
}
```

If the server does not receive the `ticket` event within 15 seconds the connection will be closed.  
The server will continue to send other events during this time.

### Joint HTTP and Websocket "session"

A device can make data updates via the HTTP API and can receive real-time updates via the websocket connection.  
In order to prevent the client being notified of its own HTTP API changes, the "session id" (`sid` claim of the auth tokens) is shared
between the HTTP API auth tokens and the socket tickets/connections.

There can only be one active websocket connection per session, meaning that if you open a connection then attempt to
open another one your first connection will be automatically closed.  

## Server Sent Events

### User Events
User events are related to the current user, examples include changes to account data such as email, password etc.  
A device will always receive user events for the current user.

- `user-update`
- `user-password-change`
- `user-email-change`
- `user-delete`

### Vault Events
Vault events are for informing the device of changes to the current users vaults.
A device will always receive these vault events.

- `vault-create`
- `vault-update`
- `vault-delete`

### Data Events
Data events are for the synchronisation of vault content and a device must subscribe to the vaults it wishes to receive data events from.

- `item-create`
- `item-delete`

#### Event Subscription
In order to receive data events the device must subscribe to specific vaults, which is done by sending the `subscribe` event to the server, for example:

**Client sends event**
```json
{
  "messageId": "ecf43a53-a5fd-442c-8d94-1cf79463422b",
  "type": "subscribe",
  "data": {
    "vaults": [
      "e4440c93-b2a5-4896-8742-82b55f765c9f",
      "90156e0f-f183-466d-97ae-1fff5f464293"
    ]
  }
}
```

**Server acknowledges that client request has been handled (or may send `error` message):**
```json5
{
  type: "ack",
  data: {
    messageId: "ecf43a53-a5fd-442c-8d94-1cf79463422b"
  }
}
```

If the device wishes to change the vaults it's subscribed to, it can re-send the `subscribe` event.  
This event will overwrite any previous subscriptions, so if you were to subscribe to 3 vaults and then later subscribe to 1 extra vault,
unless you also include the first three vaults in your second `subscribe` event you will be unsubscribed from them.

### Error Events
The server may send an `error` event in response to a client request or if something else has gone wrong, for example:

```json
{
  "type": "error",
  "data": {
    "messageId": "ecf43a53-a5fd-442c-8d94-1cf79463422b",
    "identifier": "resource-not-found",
    "message": "attempted to subscribe to vault '90156e0f-f183-466d-97ae-1fff5f464293' which could not be found"
  }
}
```


## Other details
- If the device sends an unrecognized or unexpected event to the server the connection will be closed.
- Clients should always include a different randomly generated `id` parameter (UUID v4) in each sent message, which is used by the server to send acknowledgements.
