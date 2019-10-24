# YAM - Messenger

YAM Messenger is a decentralized user-friendly instant messenger application which faciliates peer-to-peer communication between the WebRTC clients.
This app uses the WebRTC standard to enable audio, video and data real-time communication. 
The only requirement for using this app in *production* is to start a signalling server for peer discovery.

## Installation and usage in development mode

1. Clone the repository `git clone https://gitlab.tubit.tu-berlin.de/vasilvasilev/AWT-DApp-IM.git`
2. Run `npm i` in the root folder of the `AWT-DApp-IM`
3. Go to the signalmaster subfolder `AWT-DApp-IM/signalmaster` and install all dependencies `npm i`
4. Run the signalling server in the signalmaster subfolder with `node server.js`
5. Start the messenger app in the root folder of `AWT-DApp-IM` with `npm run start:dev`

## Usage in production
Both apps are deployed on heroku.

1. Verify that the signalling server is running under https://lit-hollows-18487.herokuapp.com/
2. Open the deployed app on https://infinite-castle-20660.herokuapp.com/

## License

Authors: Christian Mischok, Vasil Vasilev, Abhaniv Bhardwaj


The MIT License (MIT) Copyright (c)