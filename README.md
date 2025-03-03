---

<div align="center">
<p><b>⚠️ Under Active Development ⚠️</b></p>
<p>This app is early in development and not yet ready for general use.<br>
Dont trust this app with any important data and expect bugs, missing docs, incomplete features etc!</p>
</div>

---

# Headbase
The customizable database for your brain. Note-taking, task-management, personal knowledge bases and more.

## About
The way each person wants to organise their content is unique, personal and often use-case specific. Headbase gives you the building blocks to create content databases by
defining content types, creating content items and then filtering and displaying those items using views like a list, kanban board, calendar, infinite canvas and more.  

Headbase is not just a "notes app" or a "task management" app. It is what you decide to build.  

![](docs/screenshot-placeholder.png)

## How it works

### Content structure

The Headbase content system is built using four building blocks:
- **Fields** are the core of your content, and range from basic types like text and numbers to more advanced types like media, scales and relationships.
- **Content types** are where you define your concept of a note, task, recipe, bookmark... anything you want. A content type is a pre-defined group of fields with extra settings such as default values.
- **Content items** are where all your actual content lives. You create content items of a specific type and populate the fields as required.
- **Views** allow you to query your content items and display the results using a list, kanban board, calendar, canvas and more.

![](docs/user-guide/content-structure/content-structure-abstract.svg)

### Databases
All content in Headbase is stored in a database and you can create as many as you want, examples might include "Personal", "Work", "Project 1", "Project 2" etc.  
Each database is completely seperate, however you are able to import/export your content and data structures between databases. 

When creating a database you pick an "unlock passowrd" which will be used to encrypt/decrypt the database on your device.  
If you want to learn more about how this encryption works, you can check out the **[encryption specification](/docs/development/web/encryption/index.md)**.  


### Cloud Features
Headbase is a local-first progressive web app (PWA), meaning that by default all your data is stored on your device. There is no server or internet connection required after you've visited the app for the first time, as the app will be cached for offline use.

If you wish to enable features like cloud backups and cross-device synchronisation, you can do this by **[self-hosting your own server](/docs/self-hosting/index)**.  
Headbase uses client-side encryption to encrypt content on your device, which means that the server is unable to decrypt and access your content.

## Supported devices
Headbase aims to support desktop and mobile devices using Firefox, Google Chrome or other Chromium-based browsers like Brave etc.

Safari on macOS and iPhone is not officially supported right now because Headbase is built by one developer who doesn't use Safari or own an iPhone!  
Support for Safari also has several unique challenges such as [intelligent tracking prevention](https://webkit.org/blog/9521/intelligent-tracking-prevention-2-3/) deleting website data after 7 days of inactivity,
Safari [not enabling tab navigation by default](https://www.a11yproject.com/posts/macos-browser-keyboard-navigation/), and Apple's historic [hostility towards progressive web apps](https://open-web-advocacy.org/blog/apple-backs-off-killing-web-apps/).  
Safari might still work for you, however please bear in mind that it is mostly untested and issues are unlikely to be prioritised and may not be fixed at all.

## Development
If you want to understand how Headbase is built and poke around the code then you can view the **[developer documentation](/docs/development/index.md)**.  
This documentation is currently incomplete and possibly outdated in places due to ongoing development and changes. Here are few key points:
- The project is structured as a monorepo, all projects including the web app and server can be found in the `./packages` folder.
- The front-end web app is built using React, Tailwind and Vite.
- SQLite is used for data storage, specifically the WASM build of [SQLite3MultipleCiphers](https://github.com/utelle/SQLite3MultipleCiphers) to provide encryption support.
- The back-end server is built using Node.js, and provides an HTTP API and Websockets interface for user management and content backup/syncronisation.

## Contributions
This project is open source, not open contribution.  
This is a personal project in its early stages. You're more than welcome to try it out, ask questions, raise bug reports etc but 
it wouldn't be practical to accept external code contributions or feature requests at this time.

I'm open to this changing in the future once the project is more stable though, collaboration is one of the great things about
open-source after all!

## License
All parts of Headbase are released under the [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) license.  
