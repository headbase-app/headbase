#  [WORKING DRAFT] Synapse Relay Specification - `001`

**Notes:**:
- Formalise `/ [GET]` request for server info?
- Add dedicated health check mechanism, like `/health [GET]`?
- Add possibility for error responses from relay?
- Add messageId (`mid`) property to messages, allowing for reply patterns?
- Add public/private key authentication:
  - Peer requests short-lived connection challenge for public key (JWTs perhaps, random and stateless but signed with expiry so server can validate)
  - Peers signs challenge with private key to prove ownership over public key
  - Peer includes challenge response when opening websocket connection to the relay
- Revisit message topics/filter messages.
---

This specification defines the behaviour and message protocol a synapse relay server MUST implement.  
This covers the process for authentication and a message protocol designed to establish a shared foundation while allowing peers to evolve their own custom messaging protocols on top.  

Note that this initial specification version does not define a robust identity or authentication system, just the bare minimum to support a single user and protect from public access.

## Overview
The server does not provide a single "global" or "public" relay, peers connect using a relay identifier (`rid`) and can communicate with other peers connected to that same identifier.  
This is similar to the concept of a "room" seen in WebSocket libraries such as [socket.io](https://socket.io/docs/v4/rooms/).  
Peers cannot discover or communicate with other peers connected via a different relay identifiers.  

Note that in this initial specification the server is not expected to authenticate access to a given relay identifier, only access to the server itself.  
A future protocol version would likely introduce more robust identity and authentication, for example using public/private key cryptography where relay identifiers are public keys.

## Authentication / Connection
The server MUST restrict relay access via a basic secret token, meaning only those with the token can access relays.

The server MUST expose the WebSocket relay server via the URL `/relay/<RELAY-ID>` and expect the secret token to be included in the `Sec-WebSocket-Protocol` header.  
Peers MUST also supply a peer ID (`pid`) UUIDv4 query parameter to identify themselves, and optionally a human-readable (`knownAs`) string parameter too.

The server MUST validate the token and deny the WebSocket connection if not valid.  
The server MUST validate the `pid` query parameter and prevent multiple peers using the same identifier. It should deny the connection if either scenario fail.  
The server MAY also choose to validate the `knownAs` parameter and deny connections if multiple peers attempt to use the same name.

The server MUST deny all WebSocket connections not made to the relay URL defined above.

## Connection Management
There is no currently defined behaviour for re-authentication or similar. This may change in future specification versions.    

The server MUST only allow peers to communicate with other peers connected via the same relay identifier.   

A heatbeat mechanism for monitoring connection health is described in the "messaging" section below, which the relay and all peers MUST follow.

## Messaging
All messages sent and received MUST be UTF-8 encoded JSON object conforming to the [message types](#message-type-reference) described below.  
The relay and peers SHOULD validate messages, and on malformed or unexpected messages, may choose to either ignore them or close the connection.

### Heartbeat Connection Checks (ping/pong)
In order to monitor connection health the server MUST send periodic `health/ping` messages to all peers. When receiving these, the connected peer MUST respond by sending a `health/pong` message.  
The server MUST determine that a connection is stale if the peer sends no pong replies or other messages for a given duration (exact value is at the discretion of the server), at which point it MUST close the connection.  

Peers MUST implement the same logic to monitor connection health with the server.  
The peer MUST periodic `health/ping` messages, which the server MUST respond to by sending a `health/pong` message.
A peer MUST determine that a connection is stale if the server sends no pong replies or other messages for a given duration (exact value is at the discretion of the peer), at which point it MUST close the connection and attempt to reconnect.

The server MUST never relay `health/ping`/`health/pong` messages between peers, these are unique to each connection.

### Peer Discovery
When a peer connect or disconnects, the server MUST broadcast a `peers/list` message to all peers connected to the given relay, including the newly connected peer if applicable.
Peers may also choose to send a `peers/discover` message at any time, which the server MUST respond to by sending a `peers/list` message.   
When responding to a `peers/discover` message, the server MUST only send the reply to the requesting peer.

### Messages
A peer can send a message to all other connected peers using `msg/all`.
On receiving a broadcast message, the server MUST attach the `from` property (the sending peers `pid`) before broadcasting the message to other peers.   
The sending peer MUST not be re-sent their own message.  

Broadcast messages MAY include a `topics` property (array of strings) used to categorise messages at the sending peers discretion.

#### Topics
At any point a peer MAY choose to send a `topics/subscribe` message to request the relay only sends `msg/all` messages containing a specific topic or group of topics:

```json
{
  "kind": "topics/subscribe",
  "topics": [
    "topic1",
    ["topic2", "topic3"],
    "topic4"
  ]
}
```

On receiving this subscribe request, the relay MUST store the peers requested topics and use these until the peer sends another `topics/subscribe` message or a `topics/unsubscribe` message.  
The server MUST not relay `topics/subscribe` or `topics/unsubscribe` messages between peers, these are unique to each connection.

When broadcasting within a relay, the server MUST check for any topic subscriptions for each peer and if present MUST only send to the peer if a topic is matched.

Topics MUST be interpreted as follows:
- Given a string, a message `topics` array MUST contain that value.
- Given an array of strings, a message `topics` array MUST contain ALL given values.
- Only one topic needs to be met for a peer to receive the message.
- Given a message with no `topics` array, this MUST NOT be sent to peers with active topic subscriptions.

Given the example message above for example, the logical representation of the conditions would be as follows:
```
topic1 OR (topic2 AND topic 3) OR topic4
```

After sending a `topics/subscribe` message, peers CAN assume the topic filters are now applied,
however SHOULD always be prepared to handle or ignore unexpected messages at the peers discretion.

At any point a peer MAY choose to send an `topics/unsubscribe` message to remove the active topic filters previously applied.  
When receiving this message, the server MUST remove the topic filters and begin sending all broadcast messages again.  
If the peer has no active topic filters and sends an `topics/unsubscribe` message, the server MAY choose to ignore the message
or close the connection.

### Direct Messaging
A peer can send direct messages to one or more specific peers connected to the same relay using the `msg/dm` message.   

This message kind includes a `to` property which MUST always be an array of one or more peer identifiers (`pid`).
The server MUST still attach the `from` property and MUST retain the `to` property when sending the message.  
The server MUST then send the message to the specific peer/s only.

On an invalid `pid` value, the server may choose to either ignore the message or close the connection.

### Message Type Reference

#### Common Messages

Message used to request a `health/pong` event, used to monitor connection health:
```json5
{
  kind: "ping",
}
```

Message response to a `health/ping` request, used to monitor connection health:
```json5
{
  kind: "pong",
}
```

#### Peer Sent Messages

Message used to discover connected peers:
```json5
{
  kind: "peers/discover"
}
```
Server will respond with a `peers/list` message (see below).


Message to broadcast to all peers:
```json5
{
  kind: "msg/all",
  // (optional) string or object - the message content
  // treated as opaque by the relay
  data: "",
  // (optional) object - metadata about the message
  // treated as opaque by the relay, is intended to allow peers to include metadata seperate from the message content.
  // this could be used in cases such as versioning, hashing, additional type metadata etc.
  meta: {},
  // (optional) array of strings - topics to categorise messages which other peers can filter.
  topics: ["topic1"]
}
```

Direct message a specific peer/group of peers:
```json5
{
  kind: "msg/dm",
  // (required) array of UUIDv4 string - included to send the message to a specific peer
  to: ["00000000-0000-0000-0000-000000000000"],
  // (optional) string or object - the message content
  // treated as opaque by the relay
  data: "",
  // (optional) object - metadata about the message
  // treated as opaque by the relay, is intended to allow peers to include metadata seperate from the message content.
  // this could be used in cases such as versioning, hashing, additional type metadata etc.
  meta: {},
}
```

Request that the relay only sends `msg/all` messages matching on of the supplied topic conditions:
```json5
{
  kind: "topics/subscribe",
  // (required) string|string[] - topic filters the relay should apply.
  topics: [
    "topic1", // topics includes topic1
    ["topic2", "topic3"] // topics includes topic AND topic3
  ],
}
```

Request that the relay removes any current topic filters:
```json5
{
  kind: "topics/unsubscribe"
}
```

#### Server Sent Message

On receiving a `msg/all` or `msg/dm` message, the relay MUST add the `from` property containing the peer's `pid` value when relaying on to the other peer/s.

Message broadcast to all peers:
```json5
{
  kind: "msg/all",
  // (required) UUIDv4 string - the peer which sent the message
  from: "00000000-0000-0000-0000-000000000000",
  // (optional) string or object - the message content
  // treated as opaque by the relay
  data: "",
  // (optional) object - metadata about the message
  // treated as opaque by the relay, is intended to allow peers to include metadata seperate from the message content.
  // this could be used in cases such as versioning, hashing, additional type metadata etc.
  meta: {},
  // (optional) array of strings - topics to categorise messages which other peers can filter.
  topics: ["topic1"]
}
```

Direct message sent to a specific peer/group of peers:
```json5
{
  kind: "msg/dm",
  // (required) UUIDv4 string - the peer which sent the message
  from: "00000000-0000-0000-0000-000000000000",
  // (optional) string or object - the message content
  // treated as opaque by the relay
  data: "",
  // (optional) object - metadata about the message
  // treated as opaque by the relay, is intended to allow peers to include metadata seperate from the message content.
  // this could be used in cases such as versioning, hashing, additional type metadata etc.
  meta: {},
}
```

Response to `peer/discover` requests sent by peers. This MUST only be sent to the peer sending the request:
```json5
{
  kind: "peers/list",
  peers: [
    {
      // (required) UUIDv4 string - the pid
      pid: "00000000-0000-0000-0000-000000000000",
      // (optional) string - the name supplied by the peer on connection
      knownAs: "<human readable peer/connection name>",
    }
  ]
}
```
This message MUST also be broadcast by the server when a peer connects or disconnects.
