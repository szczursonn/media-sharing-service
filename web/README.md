# media-sharing-service frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Installation
1. Clone this repository  
`git clone https://github.com/szczursonn/media-sharing-service`  
`cd media-sharing-service/web`  
2. Install dependencies  
`npm install`  
3. Configure  
`nano .env`  
4. Run  
`npm run start`  

#### Build  
`npm run build`

## Configuration
Configuration is done using enviroment variables  
.env file is supported  
|variable|description|required?|default value|
|---|---|---|---|
|PORT|create-react-app development server port|NO|3000|
|REACT_APP_API_URL|backend url|YES|-|
|REACT_APP_ENABLE_MOCK_LOGIN|set to `true` to show enable mock login|NO|false|
|REACT_APP_DISCORD_URL|url to redirect to after clicking Login With Discord button|YES|-|
|REACT_APP_GOOGLE_URL|url to redirect to after clicking Login With Google button|YES|-|
|REACT_APP_GITHUB_URL|url to redirect to after clicking Login With Github button|YES|-|