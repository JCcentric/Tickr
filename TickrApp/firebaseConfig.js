import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getStorage } from "firebase/storage"; 
import Constants from 'expo-constants';


// Attempt to read values from EAS secrets first, then fallback to local .env
  const firebaseConfig = {
  apiKey: Constants.expoConfig.extra?.API_KEY || process.env.API_KEY,
  authDomain: Constants.expoConfig.extra?.AUTH_DOMAIN || process.env.AUTH_DOMAIN,
  projectId: Constants.expoConfig.extra?.PROJECT_ID || process.env.PROJECT_ID,
  storageBucket: Constants.expoConfig.extra?.STORAGE_BUCKET || process.env.STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig.extra?.MESSAGE_SENDER_ID || process.env.MESSAGE_SENDER_ID,
  appId: Constants.expoConfig.extra?.APP_ID || process.env.APP_ID
}; 


// Log values (optional)
console.log("Firebase config values:", firebaseConfig);

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

