# Tickr App

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

A React Native app built using Expo that allows users to create and manage Tickrs (event countdowns) with images, descriptions, and dates.

---

## 📌 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running the App](#running-the-app)
5. [Testing on Devices](#testing-on-devices)
6. [Maintenance Notes](#maintenance-notes)
7. [Build & Deployment](#-build--deployment)
8. [Useful Links](#-useful-links)

---

## ✅ Overview
The Tickr app allows users to create countdown events with images and descriptions. It uses **Firebase** for storage & authentication and **React Native with Expo** for cross-platform support.


## 🔍 Prerequisites
Before setting up the app, ensure you have the following installed:

- [Node.js (Latest LTS Version)](https://nodejs.org/)
- [npm (Comes with Node.js)](https://docs.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)
- **Mac Users:** [Xcode](https://developer.apple.com/xcode/) for iOS testing
- **Windows/Mac Users:** [Android Studio](https://developer.android.com/studio) for Android testing

Additionally, you will need to set up .env in your root directory with your firebase API and variables:

'''
EXPO_PUBLIC_API_KEY="Your Firebase API key"
EXPO_PUBLIC_AUTH_DOMAIN="Your Auth Domain"
EXPO_PUBLIC_PROJECT__ID="Your Firebase Project ID"
EXPO_PUBLIC_STORAGE_BUCKET="Your Firebase storage bucket"
EXPO_PUBLIC_MESSAGE_SENDER_ID="Your Message Sender ID"
EXPO_PUBLIC_APP_ID="Your App ID"
'''

All of this can be retried from your firebase console > Gear Icon > Project settings > General tab > Scroll down to Web apps. If not there, create app and go through the steps.

---

## ⚙ Installation

Clone the repository:

```
git clone <GIT_REPO_URL>
cd TickrApp
```


Install dependencies:
```
npm install
```

If you don’t have Expo CLI installed globally:
```
npm install -g expo-cli
```


## ▶ Running the App
Start the development server:
```
npx expo start
```
Scan the QR code using the Expo Go app on your device (available on iOS App Store and Google Play).

Or run in an emulator:
- iOS: Press 'i' in the terminal to launch in Xcode Simulator.
- Android: Press 'a' to launch in Android Emulator.

## 📱 Testing on Devices
- iOS: Requires Xcode installed and configured.
- Android: Requires Android Studio and an emulator or a physical device with USB debugging enabled.

## 🔧 Maintenance Notes
Always pull the latest changes before making updates:
```
git pull origin main
```

To update dependencies:
```
npm update
```
If you encounter issues with cached data, clear Expo cache:
```
npx expo start -c
```
## ✅ Build & Deployment
### Building for Development
#### Android
1. Make sure Android Studio and SDKs are installed.

2. Run the following to generate a release build:
```
npx expo build:android
```
3. Follow prompts to generate an APK or AAB.

4. Test the build on an emulator or physical device before publishing.

#### iOS
1. Make sure Xcode is installed.
2. Run the following to build for iOS:
```
npx expo build:ios
```
3. Open the generated project in Xcode to archive and submit to the App Store.
4. Test on an iOS simulator or physical device before publishing.

## 🔗 Useful Links
- Expo [Documentation](https://docs.expo.dev/)
- React Native [Documentation](https://reactnative.dev/docs/getting-started)
- Firebase Setup [Guide](https://firebase.google.com/docs)