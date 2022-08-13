# media-sharing-service
Service for sharing media (images/videos) with other people  
![list of albums](docs/doc_img2.jpg)
![contents of an album with a video playing](docs/doc_img3.jpg)  
## Table of contents
1. [Live demo](#live-demo)
2. [Features](#features)
3. [Technologies/Libraries used](#technologieslibraries-used)
## [Live demo](http://adhesive-invention.surge.sh/)
⚠️ **Logging in with Google is disabled for easier showcasing: use mock login option and enter a random number/string as foreign id**  
⚠️ Live demo doesn't use HTTPS  
![mock login window](docs/doc_img1.jpg)  
- Invite to example commmunity: [qKXQ1sf-](http://adhesive-invention.surge.sh/i/qKXQ1sf-) (maxUses: inf, expires: never)
### Live demo deployment details
- React frontend: [surge.sh](https://surge.sh/)
- Node.js backend: Google Cloud Compute Engine instance
- Database: sqlite3 file database
- File Storage: Google Cloud Storage
## Features
You can:
- Share images and videos with selected group of people (communities)
- Organize images and videos into albums
- Login with multiple OAuth2 Providers
- Control other users permissions as community owner (allow/disallow uploading)
## Technologies/Libraries used:
- [Web frontend](web/README.md): (/web)
  - React 18 (through [Create React App](https://github.com/facebook/create-react-app))
  - Typescript
  - Material UI v5
  - Redux
  - React Router v6
- [Backend service](backend/README.md): (/backend)
  - Node.js 18
  - Typescript
  - Express.js
  - TypeORM (sqlite, mariadb)
  - Google Cloud Storage
  - JWT
  - Jest