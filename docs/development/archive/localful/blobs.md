## Blobs
Blobs are for data that doesn't fit into the content versioning structure, which could include things like
images, files or even text and structured data like JSON.  
Blobs are designed to work on a "last write wins" basis on the server, where a client must supply an update timestamp
and the new blob will only be saved if the currently saved timestamp on the server is less.  
Blobs are also saved with a type field and hash, the intention being that this would allow clients to handle the blob as required by that application.
For example, by saving file extensions like `png` and `md` in the type field an app may handle these blobs differently.
Image files may be just treated at 'last write wins' but text files like markdown could be processed via a diff/patch
system so changes from the server can be gracefully synced into the local content and synced back with the server.
The hash field is to help with synchronisation between clients, as the hash can be used
to compare the client and server version of a blob without having to request and compare against the entire blob.

Blobs are currently just REST resources stored in the server database and are limited to TODO MB.
To support bigger blobs, a file system based approach may be considered instead where blob metadata is saved to the database
but the blog data itself is saved to persistent file storage on the server.
