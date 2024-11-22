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
The way each person wants to organise their content is unique, personal and often use-case specific. Headbase gives you the building blocks to create your own content databases by
defining content types, creating content and then querying and displaying that content using views which include a list, kanban board, calendar and infinite canvas.  

Headbase is not just a "notes app" or a "task management app", it is what you decide to build.  

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
All content in Headbase is stored in a database, which you create with a name and an unlock password.  
This unlock password is used to protect an encryption key which is generated when you first create the vault. The encryption key is used to encrypt the database on your device, and if you connect to a sever then also to encrypt
all content before it leaves your device.  

If you want to learn more about how this encryption works, you can check out the **[encryption specification](/docs/development/web/encryption/index.md)**.  

You can create more than one database, so you can have different databases for different purposes such as "Personal", "Work", "Project 1", "Project 2" etc.  
Headbase doesn't have any collaboration features, but if these were to be added in the future then access would be managed at this database level.  

Due to encryption and the future possibility of collaboration features, it is not possible to reference content across different databases.

### Cloud Features
Headbase is a local-first progressive web app, meaning that all your data is stored on your device. No server required and no internet connection after you've visited the app for the first time as the app will be cached for offline use.

If you wish to enable features like cloud backups and cross-device synchronisation, you can do this by **[self-hosting your own server](/docs/self-hosting/docker.md)**.  
Headbase uses client-side encryption to encrypt content on your device, which means that only you can access that content and the server is unable to decrypt your content.

## Development
If you want to understand how Headbase is built and poke around the code then you can view the **[developer documentation](/docs/development/index.md)**.  
The documentation is currently incomplete and possibly outdated in places due to ongoing development and changes. Here are few key points:
- The project is structured as a monorepo, all projects including the web app and server can be found in the `./packages` folder.
- The front-end web app is built using React, Tailwind and Vite.
- SQLite is used for data storage, specifically the WASM build of [SQLite3MultipleCiphers](https://github.com/utelle/SQLite3MultipleCiphers) to provide encryption support.
- The back-end server is built using Node.js, and provides an HTTP API and Websockets interface.

## Contributions
This project is open source, not open contribution.  
This is a personal project in its early stages. You're more than welcome to try it out, ask questions, raise bug reports etc but 
it wouldn't be practical to accept external code contributions or feature requests at this time.

I'm open to this changing in the future once the project is more stable though, collaboration is one of the great things about
open-source after all!

## License
Headbase is released under the [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) license.  
This covers all parts of Headbase, including the web app and server.  
