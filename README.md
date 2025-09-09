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
6. [Screenshots](#screenshots)
7. [Project Structure](#project-structure)
8. [Maintenance Notes](#maintenance-notes)
9. [Build & Deployment](#-build--deployment)
10. [Useful Links](#-useful-links)

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

## 📸 Screenshots
(Add your screenshots here later)
Home Screen	Create Tickr Screen

## 📂 Project Structure
```text
tickr-app/
│
├── assets/          # Images and fonts
├── components/      # Reusable UI components (e.g., TickrCard)
├── screens/         # Screens like Home, CreateTickr, TickrDetails
├── models/          # Class files for OOP design
├── App.tsx          # Main entry point
├── package.json     # Project dependencies
└── README.md        # Project documentation
```

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
### Building for Production
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