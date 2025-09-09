import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getStorage } from "firebase/storage"; 

//You will enter your own firebase config values here
// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "Enter your API key here",
  authDomain: "Your auth domain here",
  projectId: "tickrapp-001",
  storageBucket: "Your storage bucket here",
  messagingSenderId: "Enter your messaging sender ID here",
  appId: "Enter your app ID here"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export let auth;
if (Platform.OS === 'web') {
  // Web persistence uses the default getAuth
  auth = getAuth(app);
} else {
  // React Native persistence with AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

