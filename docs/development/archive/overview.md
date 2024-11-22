# Overview
If you're after a quick explanation for the "what, why and how" of Localful, you've come to the right place!

## Why I built Localful

There are lots of tools and libraries to help you develop local-first web applications, however these often require building around CRDTs, eventual consistency, conflict resolution and other concepts
which fundamentally change how you build apps, and how you store and manage data.  
These concepts are incredibly powerful and useful when needed, but introduce a world of complexity when your use case doesn't require them.


### 🌱 A focus on simplicity, interoperability and longevity
What does it mean to say that Localful focuses on simplicity, interoperability and longevity?

- **Simplicity**

  Software should be simple, for developers and users. Localful doesn't use CRDTs or complex systems for eventual consistency, conflict resolution etc. It stores and synchronises data using immutable versions which are created when data is changed and accepts the tradeoffs and limitations of this method. This allows you to easily understand what's going on and how, so you can spend less time thinking and more time making.

- **Interoperability**

  Your data is yours and should be available without vendor or technology lock-in. Keeping things simple means less reliance on any specific libraries, protocols or implementations. The device library uses standard IndexDB, the server uses Postgres and a well documented HTTP and Websockets API and your data versions are stored as a simple encrypted blobs. The current focus of Localful is on web applications, however the server could be used by anything that can speak HTTP and Websockets.

- **Longevity**

  If you don't need to manage lots of complexity and build software with interoperability in mind, then you can be confident that your applications will be easier to manage in the long term and your data will stay accessible. If you do decide to migrate in the future, you have everything stored in IndexDB and Postgres ready and waiting.

## How it works

Localful works by storing data in immutable versions, where each edit a user makes creates a new version.  
This very simplistic storage method allows for version history and a basic form of concurrent editing, as multiple versions can be created simultaneously and synced without fear of conflicts as each version is distinct and immutable. All versions are synced between all devices and a last-write-wins method is used to select the most recent version as the current state of the data.

This system makes Localful most suited to use cases where:
- There is no requirement for automatically resolving or merging concurrent changes.
- The focus is on a single user editing their own content and instant real-time collaboration between different users and devices isn't a key requirement.
- The data being created is generally not super large, as creating new versions for every edit does increase storage and network costs.
- Data edits don't need to be tracked at a granular level and saving can ideally happen via explicit user action rather than something like autosaving as the user types.

Multi-user collaboration features may come to Localful the future, but the fundamental way Localful works means it will likely never be as suitable for this use case than other tooling.


### Tradeoffs
Localful isn't perfect and is built with the idea that pragmatism is better than technical perfection, this means there are some tangible tradeoffs you make which are listed below.

#### 📉 Increased Network and Storage Costs
The network and storage costs of continually creating new versions with all item data (even if not much has changed) will always be higher than many alternative systems that work by only syncing the data changes.  
This is the main tradeoff made by Localful, and the reasoning for this is that understanding and managing that network and storage cost is much easier than attempting to do something similar with a technology like CRDTs which
may require the full change history to reconstruct the current data state, or requires separate "history compression" features. Introducing client-side encryption and a central backup server also introduces extra challenges for a CRDT/changes based
system as the server has no knowledge of the data and therefore couldn't compress any changes.  

There are still ways that storage and network costs can be managed both by the client and server:
- Storage use can be kept under control by automatically deleting old versions. This may be based on version age, if over a given number of newer versions already exist etc.
- You could automatically delete all old versions from clients, and only retrieve these from the server if the user desires it.
- The frequency of version creation (and therefore the number of versions stored and sent over the network) could also be reduced by not implementing features such as automatic saving, especially at the level of syncing in real time as the user types.
  - If this is a requirement, you could implement debounce logic to still reduce the network and storage costs.
