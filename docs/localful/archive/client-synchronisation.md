# Client Synchronisation and Cloud Backups
Localful needs to be able to sync data between devices while also supporting offline usage, client side encryption and cloud backups (saving data to a server).  
To facilitate offline editing by multiple devices Localful uses [CRDTs](https://crdt.tech/), more specifically the [Automerge](https://automerge.org/) library.

Automerge does have a number of things to help with data synchronisation, most notably its [sync protocol](https://automerge.org/docs/cookbook/real-time/#sync-protocol).  
However, because At# Client Synchronisation and Cloud Backups
Localful needs to be able to sync data between devices while also supporting offline usage, client side encryption and cloud backups (saving data to a server).  
To facilitate offline editing by multiple devices Localful uses [CRDTs](https://crdt.tech/), more specifically the [Automerge](https://automerge.org/) library.  

Automerge does have a number of things to help with data synchronisation, most notably its [sync protocol](https://automerge.org/docs/cookbook/real-time/#sync-protocol).  
However, because Localful also requires client side encryption the server can't participate in Automerge's sync protocol as the server can never
actually know about any of the content.  
One solution could be for the server to just act as a relay to facilitate devices syncing between each other, but then this wouldn't provide any cloud backup/storage functionality.   

This leaves two choices:
- Save and synchronise the entire Automerge document (in an encrypted form) between the client and server
- Synchronise every change (in an encrypted form) between the client and server.  

Syncing the whole document is simpler but would cause a lot of redundant data to be sent over the network, as everytime a client wanted to update the document
it would have to re-encrypt and push an updated version.  
Real time updates would also be harder because everytime there was a change other clients would have to re-fetch the whole document.
There are also potential issues around multiple devices attempting to update the document at the same time too.  
For these reasons I've decided to sync every change between clients and the server instead, and leave it up to the clients to construct the document from all the changes it has.   

This means that devices can sync only their changes to the server, and the server can also send only the changes required back.  
Storing all the changes may lead to slower load times as devices will have to replay the changes, but this can potentially be sped up by
storing the full Automerge document locally which can be loaded quickly at startup, then synchronizing changes can happen in the background.

## Changes
A single change in this sync system is directly related to a single Automerge change, but it's not exactly the same.  
It's made up of the following data:  
- `id`: A unique ID generated when the change is made. This combines the actorID from Automerge and a generated UUID which
should make the chances of a collision practically impossible.
- `data`: The actual data containing the Automerge change (`Automerge.BinaryChange`) but encrypted on the client side.

The ID can be used to uniquely identify changes and by comparing all the change IDs returned from the server, clients
can figure out if they need to fetch and/or push changes.  

## Client-Server Communication
Websockets can be used to create a bidirectional connection between the client and server.  
There are two possible connection situations possible for synchronisation:
- A client connects/reconnects to the server
- A client is connected to the server

### Connection/Reconnection
In this case the client fetches all changes from the server (just the IDs) and compares these to its local set of changes.  
If it's missing any, it can then request them. If it has changes that the server does not, it can push them.

### Ongoing Connection
When a client is online and maintaining a connection to the server it can push changes as they happen.  
It can also listen for changes pushed from the server and update its own local changes and also the local document.  

It is assumed that when first connecting the client will have been brought up to date with all changes on the server, therefore
the client does not have to re-exchange all the changes everytime it pushes a new change, or receives one from the server.
hena also requires client side encryption the server can't participate in Automerge's sync protocol as the server can never
actually know about any of the content.  
One solution could be for the server to just act as a relay to facilitate devices syncing between each other, but then this wouldn't provide any cloud backup/storage functionality.

This leaves two choices:
- Save and synchronise the entire Automerge document (in an encrypted form) between the client and server
- Synchronise every change (in an encrypted form) between the client and server.

Syncing the whole document is simpler but would cause a lot of redundant data to be sent over the network, as everytime a client wanted to update the document
it would have to re-encrypt and push an updated version.  
Real time updates would also be harder because everytime there was a change other clients would have to re-fetch the whole document.
There are also potential issues around multiple devices attempting to update the document at the same time too.  
For these reasons I've decided to sync every change between clients and the server instead, and leave it up to the clients to construct the document from all the changes it has.

This means that devices can sync only their changes to the server, and the server can also send only the changes required back.  
Storing all the changes may lead to slower load times as devices will have to replay the changes, but this can potentially be sped up by
storing the full Automerge document locally which can be loaded quickly at startup, then synchronizing changes can happen in the background.

## Changes
A single change in this sync system is directly related to a single Automerge change, but it's not exactly the same.  
It's made up of the following data:
- `id`: A unique ID generated when the change is made. This combines the actorID from Automerge and a generated UUID which
  should make the chances of a collision practically impossible.
- `data`: The actual data containing the Automerge change (`Automerge.BinaryChange`) but encrypted on the client side.

The ID can be used to uniquely identify changes and by comparing all the change IDs returned from the server, clients
can figure out if they need to fetch and/or push changes.

## Client-Server Communication
Websockets can be used to create a bidirectional connection between the client and server.  
There are two possible connection situations possible for synchronisation:
- A client connects/reconnects to the server
- A client is connected to the server

### Connection/Reconnection
In this case the client fetches all changes from the server (just the IDs) and compares these to its local set of changes.  
If it's missing any, it can then request them. If it has changes that the server does not, it can push them.

### Ongoing Connection
When a client is online and maintaining a connection to the server it can push changes as they happen.  
It can also listen for changes pushed from the server and update its own local changes and also the local document.

It is assumed that when first connecting the client will have been brought up to date with all changes on the server, therefore
the client does not have to re-exchange all the changes everytime it pushes a new change, or receives one from the server.
