# Web Architecture

## PWA
It is expected that web apps using Localful will be progressive web apps (PWAs) in order to achieve local-first functionality.  
The basic premise of a PWA is that a service worker is used to intercept and cache assets requests, which can then be served
rather than relying on the network.  

This can introduce some difficulty though when pushing app updates however, as you then need a mechanisms to ensure that
the cache of assets is updated.

## Storage
Localful stores it's data in IndexDB and Local Storage:
- Database storage - IndexDB
- Encryption key storage - Local storage
- Server auth tokens - Local storage
- Application flags - Local storage

## Network
A HTTP API and Websockets (socket.io) are used to communicate with the server.
Requests that are direct result of user actions (such as login, register, fetch data etc) generally happen via the HTTP API in the 
application main thread, and then background data synchronization is carried out via the websocket connection.

## Web Workers
A shared worker is used so that all data synchronisation for all tabs/windows running the application happens in the
same place, off the main thread. This also allows better control over how the network and data changes are managed. 

## All together now...
The web app loads and saves data to IndexDB. This currently all happens on the main application thread. 
The data storage functionality for Localful adds an event layer on top of the IndexDB storage, this allows for
reactive data queries and for the shared worker to be informed when data has been changed.  

The shared worker sets up a Websocket connection to the server, and it can use this to send and receive data updates as required
to sync data. The shared worker also has access to the HTTP API which can also used for data sync, or for doing things
like refreshing the users session.  

The shared worker receives events when local data is saved, but it may choose to delay/rate limit how often it actually
syncs with the server.  

When the shared worker receives a data update from the server, it will make the required updates to the data storage in IndexDB
which will then also cause those data update events to be propagated to the local app instances.
