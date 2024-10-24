# Localful Encryption Specification - `v1`
This document contains the `v1` specification which described how the Localful project achieves client-side encryption.  
It also describes how user credentials are processed before being passed to the server, if server functionality is enabled.  

There are references to the client-server architecture, security and data structures of Localful too, but the primary focus is on the specific cryptographic methods used on device.  
Topics such as local-first design, cross-device synchronisation and most importantly server authentication and session management are not covered here.

---

⚠️ **Warning** ⚠️  
I'm not a mathematician, cryptographer or security expert. If you think there is a problem with this specification or my implementation, please let me know.  
I trust this specification and my implementation enough to use Localful in production myself, but at the end of the
day this is a side project I've made to learn and solve my own needs.

---

## Introduction
Localful works by creating databases which can contain data entities and data blobs.  
Encryption happens at a database level, so all data within a given database will be encrypted using
the same encryption key.

TODO
- Add more context about Localful and the required functionality that influences this spec.
- What is the purpose of this encryption? What is the threat model etc

## Summary

### Database Encryption
- When setting up a database on a local device, users supply an `unlock password`. This password and a random salt are used to derive a `database unlock key`.
- A random `database encryption key` is generated and encrypted with the `datbase unlock key` which produces a `protected database encryption key`.
- The `protected database encryption key` includes the random salt used in key derivation and the IV value used when encrypting the key.
- The `database encryption key` and `database unlock key` are only ever stored unencrypted in memory, `protected database encryption key` is saved to local storage and can be uploaded to the server.
- All database content will then be encrypted using the `database encryption key`.
- To allow Localful to work effectively, some data is not encrypted:
  - ids, timestamps and metadata. Metadata includes the Localful and schema version of content, and if the content is deleted.
  - Relationships which includes what database content belongs to, what content a version belongs to, the type of data stored in a blob etc
  - The **database name is not encrypted**. This is so databases can be identified by users prior to decryption.
  - The **device name is not encrypted**. This is set by the user each time they set up a new device and is saved to data entity versions so users can identify which device a version was created on. It it also used by the client and server during data syncronisation, hence why it needs to be unencrypted.

![A diagram of database encryption.](./diagrams/database-encryption.png)

## Server Password
- The server credentials (`account email` and `account password`) are totally separate to any database encryption in order to easily support local-only uses.
- The `account password` is used to derive an `account key`, where `account email` and an app specific `app salt` are combined as the salt for the KDF function.
- The `account key` is then split in half, where the second half becomes the `server password`.
- The `server password` is then used in server authentication along with `account email`.
- The first half of the split `account key` has no current purpose, but may in future versions of Localful for something like creating an account level encryption key or similar.

![A high-level diagram of the server password system described above.](./diagrams/server-password-derivation.png)

## Implementation Details

### Key Derivation
- `PBKDF2` is used for key derivation, configured with `100000` iterations.
- For `encryption password`:
  - a 256 bit `database unlock key` is derived.
  - a random salt value is used.
- For `account password`:
  - a 512 bit `account key` is derived
  - `<account email> + <app salt>` is used as a salt value, where `<app salt>` is a random (but global) value set by the application using Localful.
  - The `account key` is split into a 256 bit secret value (currently unused) and a 256 bit `server password`.

### Encryption
- `AES-GCM-256` is used for encrypting keys and resources, with randomly generated IV values.

### Encrypted Data Format
All encrypted data is stored as a string in the format `<spec>:<metadata>:<ciphertext>`:
- `<spec>` is just the Localful encryption spec version used (`v1`).
- `<metadata>` is a base64 encoded JSON string and includes the IV value used during encryption and the salt value if required.
- `<ciphertext>` is a base64 encoded string of the encrypted data.

### Javascript Libraries
- Argon2id is implemented using [argon2-browser](https://www.npmjs.com/package/argon2-browser).
- The standard [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) is used for all cryptographic functions except Argon2id.
- Client encryption methods are implemented in package `@localful/local` and can be found at [`projects/local/src/encryption`](../../../projects/local/src/encryption).

## Possible Improvements
- How would the specification in use and encryption method be updated once deployed in a real application? This is partly covered in the migration docs but could be made clearer here.
- Consider using `Argon2id` for key derivation, configured with `64 MiB` of memory, 3 iterations and 4 parallelism.
- Consider using `XChaCha20+Poly1305` for encryption (Using [libsodium-wrappers](https://www.npmjs.com/package/libsodium-wrappers)?)
- Server uses traditional password system. Could use Secure Remote Password (SRP) protocol be used instead?
- Salt used in `account key` derivation is not random, but should at least unique across users & apps. Should a truly random `salt` value be used instead?
  - I would then have to upload this to the server or make the user store two secrets.
  - If stored on server, this would need an API route to retrieve this on sign in. This route would have to be public or protected by 2FA? This would be like Standard Notes
  - If user needs two secrets, this would be like 1Password's two-secret system.
  - Any dramatic complexity added to sign up would have to be implemented in all applications using Localful.
