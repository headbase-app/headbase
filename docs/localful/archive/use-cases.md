
## When is this project useful?

The goal of this project is to simplify the development of local-first apps that require client-side encryption and cloud storage,
by implementing the common app and server functionality required to support these features.    
App developers should be able to focus on their unique app features, without worrying about things like device storage, user management,
cross-device sync, client-side encryption etc as these features are already implemented by Localful.

This project aims to be generic enough that it can be used for many different apps, but it does make a
number of fundamental assumptions and decisions:
- Your app will have content of one or more "content types" and content is stored in "versions". When a user creates or
edits content, they create a new version of this content. Localful does not make any assumptions about the structure of
your content, the server and local libraries simply expect an encrypted data string.
- Your app needs to support multiple users, although you could run a server for a single user with registration disabled.
- Your content needs to be organised into different vaults/collections/groups, although you can always just use a single vault.
- Vaults are owned by specific users and cross-user collaboration is not required. This functionality may be added in the future though.
- You want to support local-first offline usage of your app, where the server is optional.
- You want to synchronise content between devices, but it's ok for concurrent edits to generate different content versions that a user can manually manage.
- You don't want a purely device-to-device sync system, you also want the ability to save content to a central server for cloud storage/backup.
- You want client-side encryption so the server can't access user content, and a user is the only one able to decrypt their content.

## When might this project not be useful?

**If you don't like all the implementation opinions**  
Localful is opinionated by design and has specific client-side encryption, device storage and account functionality
which is all built to work together as one system. It's possible that your application requirements, development opinions
or both would make Localful a bad choice for you.  
In theory it's possible to pick and choose parts of Localful to use, for example the server does just expose a generic API which could be used by anything,
but in practice Localful is built with the expectation that the client-side libraries and server will be used together.

**If you need user collaboration or real-time synchronisation...**  
Localful is designed for single-user applications right now and the current server functionality and client-side encryption system
have no support for cross-user collaboration. Collaboration could be added at a vault level in the future, but it is not currently on the roadmap.  

The content versioning system used by Localful is very simplistic (by design) and therefore it is not suited
for real-time synchronisation either, at least not at a keystroke level. When a user creates or updates content on one device,
other devices can listen for this via websockets and automatically pull the updates, but this will always involve pulling
a new version of the content.  
This will be enough for some applications, but others would benefit from other more advanced technologies such as CRDTs
for storing and syncing content instead. Localful is not built to support those use cases at the moment.
