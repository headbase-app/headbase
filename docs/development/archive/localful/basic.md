
## User Accounts
- The Localful server supports many user accounts.
- User accounts require an email address and email verification.
- New account registration can be disabled if required.

## Data Structure
- Users can create vaults, which are collections of content.
- Content can be of one or more "type", which is application specific and just represented as a string.
- Content data is not actually saved to the content entity itself, but as "content versions" instead.
- The server handles all actual data as encrypted data strings, the device handles encryption/decryption and parsing this data to and from any application specific format.
- Content and content versions are immutable once created, there is no mechanism to "update" content without creating a new "version".
- It is up to each device and not the server to determine which content version should be the "current version" shown to the user. 
- Vaults can have blobs too, which are designed to store things like image and audio files. These work on a 'latest write wins' basis and are not versioned.
- Each application should use its own server instance.
- The storage costs of always saving new content versions is high, so the server dictates the maximum number and age of content versions allowed, as well as the maximum size of a single content version and blob.
