# media-sharing-service backend
Node.js backend for media-sharing-service

## Table of contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Source code structure](#source-code-structure-src)
4. [Mock OAuth2 Provider behaviour](#mock-oauth2-provider-behaviour)
5. [Auth solution overview](#auth-solution-overview)

## Installation
1. Clone this repository  
`git clone https://github.com/szczursonn/media-sharing-service`  
`cd media-sharing-service/backend`  
2. Install dependencies  
`npm install`  
3. Configure  
`nano .env`
4. Run  
`npm run start-ts`  
or  
`npm run build`  
`npm run start`

## Configuration
Configuration is done using enviroment variables  
.env file is supported  
|variable|description|required?|default value|
|---|---|---|---|
|PORT|port for the app|NO|3000|
|NODE_ENV|node enviroment, set to `production` in production|NO|development|
|DEBUG|set to `true` to enable extra logging|NO|false|
|JWT_SECRET|secret key for signing tokens|YES|-|
|MEDIASTORAGE_TYPE|type of mediastorage: `google`/`local`/`mock`|YES|-|
|LOCALSTORAGE_DIR|directory for local media storage|YES if MEDIASTORAGE_TYPE=`local`|-|
|GOOGLE_STORAGE_BUCKETNAME|google cloud storage bucketname for files|YES if MEDIASTORAGE_TYPE=`google`|-|
|GOOGLE_APPLICATION_CREDENTIALS|path to google's key|YES if MEDIASTORAGE_TYPE=`google`|-|
|DB_TYPE|database type: `sqlite`/`mariadb`|YES|-|
|DB_FILE|database filename, for in-memory use `:memory:`|YES if DB_TYPE=`sqlite`|-|
|DB_HOST|database address|YES if DB_TYPE=`mariadb`|-|
|DB_PORT|database port|NO|-|
|DB_USERNAME|database username|YES if DB_TYPE=`mariadb`|-|
|DB_PASSWORD|database password|NO|-|
|DB_NAME|database name|YES if DB_TYPE=`mariadb`|-|
|RESET_DB|set to `true` to reset database (drop all tables) on app launch|NO|false|
|DISCORD_CLIENTID|Discord client id from https://discord.com/developers/applications/|NO|-|
|DISCORD_CLIENTSECRET|Discord client secret from https://discord.com/developers/applications/|NO|-|
|DISCORD_REDIRECTURI|Discord redirect uri as set on https://discord.com/developers/applications/|NO|-|
|GOOGLE_CLIENTID|Google client id from https://console.cloud.google.com/apis/credentials/oauthclient/|NO|-|
|GOOGLE_CLIENTSECRET|Google client secret from https://console.cloud.google.com/apis/credentials/oauthclient/|NO|-|
|GOOGLE_REDIRECTURI|Google redirect uri as set on https://console.cloud.google.com/apis/credentials/oauthclient/|NO|-|
|GITHUB_CLIENTID|Github client id from https://github.com/settings/developers|NO|-|
|GITHUB_CLIENTSECRET|Github client secret from https://github.com/settings/developers|NO|-|
|GITHUB_REDIRECTURI|Github redirect uri as set on https://github.com/settings/developers|NO|-|
|DISCORD_MOCK|set to `true` to use mock oauth2 provider with Discord|NO|false|
|GOOGLE_MOCK|set to `true` to use mock oauth2 provider with Google|NO|false|
|GITHUB_MOCK|set to `true` to use mock oauth2 provider with Github|NO|false|

## Source code structure (`/src`)
- `/config`: app configuration loader
- `/errors`: directory for custom errors
- `/middlewares`: custom express middlewares
- `/models`: TypeORM Entities
- `/routes`: routes + http controllers
- `/services`: services divided by entities they mainly handle excluding AuthService which is for auth
  - `/MediaStorages`: implementations of media storage
  - `/OAuth2Provider`: handlers for different OAuth2 providers
- `/types`: Typescript type declarations + validator functions
- `/utils`
- `/createDataSource.ts`: functions for creating a TypeORM datasource with or without sample data (for testing)
- `/createServer.ts`: functions for creating an express.js server, a real one or one for testing
- `/Logger.ts`: custom logger
- `/index.ts`: app's entry point

## Mock OAuth2 Provider behaviour
Mock OAuth2 Provider always returns a profile where foreign id is the code from the request, excluding `'invalidcode'` which simulates an invalid OAuth2 Code response.

## Auth solution overview
After the user logs in, a session is created in a database with an unique id.
The session id is then placed inside a JSON Web Token, which is then returned to the client.
The client then authenticates using Authorization header on every request that requires authentication. User logout is handled by deleting the session from the database.
