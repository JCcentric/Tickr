import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getStorage } from "firebase/storage"; 

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfMEbty2tprhTUMUjSPFI6AefkNQwJUGw",
  authDomain: "tickrapp-001.firebaseapp.com",
  projectId: "tickrapp-001",
  storageBucket: "tickrapp-001.firebasestorage.app",
  messagingSenderId: "618582402852",
  appId: "1:618582402852:web:a05709692a7143873cb5b1"
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

