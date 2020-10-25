# small-talk

A chat app built with React Native compatible with both Android and IOS devices. The app sends and receives messages, and also stores them locally, to enable limited offline usability.

You can also take pictures and send them via the app, select images from your gallery to end, or share location information. The app interface is build with Gifted-Chat Library, uses Google Firebase Firestore as the database, and documentation is generated using JSDoc. Finally, the Expo framework is used for building and testing the app.

## Dependencies :

- "@react-native-community/async-storage": "~1.12.0",
- "@react-native-community/masked-view": "0.1.10",
- "@react-native-community/netinfo": "5.9.6",
- "@react-navigation/native": "^5.7.3",
- "@react-navigation/stack": "^5.9.0",
- "expo": "^39.0.3",
- "expo-cli": "^3.27.14",
- "expo-image-picker": "~9.1.0",
- "expo-location": "~9.0.0",
- "expo-status-bar": "~1.0.2",
- "firebase": "7.9.0",
- "permissions": "^0.1.0",
- "react": "16.13.1",
- "react-dom": "16.13.1",
- "react-native": "https://github.com/expo/react-native/archive/sdk-39.0.3.tar.gz",
- "react-native-gesture-handler": "~1.7.0",
- "react-native-gifted-chat": "^0.16.3",
- "react-native-maps": "0.27.1",
- "react-native-reanimated": "~1.13.0",
- "react-native-safe-area-context": "3.1.4",
- "react-native-screens": "~2.10.1",
- "react-native-web": "~0.13.7",
- "react-navigation": "^4.4.0",
- "react-navigation-stack": "^2.8.2"

# Prerequisites

- Install [Expo](https://expo.io/): `npm install expo-cli -g` or `yarn global add expo-cli`

- For Windows and Linux: Install [Android Studio](https://developer.android.com/studio).<br>
  For more information how to set up an emulator, look [here](https://docs.expo.io/versions/latest/workflow/android-studio-emulator/)

- For Mac: Install [XCode](https://developer.apple.com/xcode/)

- Install the Expo app on your mobile device (available in Google Play Store and Apple Store)

# Getting started

- To install all the dependencies: `npm i`

- To start the app: navigate to your project folder, then `expo start`

- Launch app on physical device (easiest way): scan QR code in Expo GUI

- Launch app on emulator: Press "Run on Android device/emulator in Expo GUI, AFTER starting your emulator.

# Database information

This project uses [Google Firebase/Firestore](https://firebase.google.com/) for data storage.<br>
Regarding the setup, the [Firebase documentation] is thorough and straightforward. (https://firebase.google.com/docs/web/setup)

## Set up Firestore for your React Native project

1. Sign in, then click on "Go to console" link

2. Choose to start in test mode, so we don't need to create any security rules. Note: once you start receiving the warning emails regarding the test rules, 

3. Install Firestore via Firebase in your project: `npm install firebase` or `yarn add firebase`

4. Import Firestore in your App.js file

```javascript
const firebase = require("firebase");
require("firebase/firestore");
```

5. Back in the Firestore console in your browser, open up "Settings", then "General". Under "Your apps" you can generate configurations for different platforms. Here, click "Firestore for Web". Copy the contents of the `config` object.

6. In Chat.js, create a constructor in the App class. Here you can paste the data you copied from `config` object.

> Example
>
> ```javascript
> firebase.initializeApp({
>   apiKey: "your-api-key",
>   authDomain: "your-authdomain",
>   databaseURL: "your-database-url",
>   projectId: "your-project-id",
>   storageBucket: "your-storage-bucket",
>   messagingSenderId: "your-messaging-sender-id",
>   appId: "your-app-id",
> });
> ```

7. Create a reference to the Firestore collection:

```javascript
this.referenceMessages = firebase.firestore().collection('chat');`
```

And there you have it, pretty much. Time to make awkward small talk :)
