# media-sharing-service backend
Node.js backend for media-sharing-service

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