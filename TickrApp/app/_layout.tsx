import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebaseConfig"; // your firebase config file
import { Stack } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";
import "react-datepicker/dist/react-datepicker.css";
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';




export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  //AdMob initialization
  useEffect(() => {
  // Configure SDK
  mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.PG,
    tagForChildDirectedTreatment: true,
    tagForUnderAgeOfConsent: true,
  });

  // Initialize SDK
  mobileAds()
    .initialize()
    .then(adapterStatuses => {
      console.log('AdMob initialized:', adapterStatuses);
    });
  }, []);

  //Run at app start
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);


  useEffect(() => {
    console.log("Auth state changed:", auth.currentUser);
    console.log("User state variable:", user);
  }, [user]);



  //Show loading indicator while checking authentication state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }



  return (
    <GestureHandlerRootView style={styles.container}>

      {loading ? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    ) : (
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          // User logged in → navigate to the tab group
          <Stack.Screen name="index" />
        ) : (
          // User not logged in → login
          <Stack.Screen name="login" />
        )}
        {/* Included signup, forgot password, and all other screens*/}
        <Stack.Screen name="signup" />
        <Stack.Screen name="pp" options={{presentation: 'modal', animation: 'slide_from_bottom', headerShown: false}}/> 
        <Stack.Screen name="tos" options={{presentation: 'modal', animation: 'slide_from_bottom', headerShown: false}}/>
        <Stack.Screen name="forgotPassword" /> 
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="TickrDetails" options={{presentation: 'modal', animation: 'slide_from_bottom', headerShown: false}} />
        <Stack.Screen name="EditTickr" options={{presentation: 'formSheet', animation: 'flip', headerShown: false}} />
        <Stack.Screen name="CreateTickr" options={{presentation: 'formSheet', animation: 'slide_from_bottom', headerShown: false}} />
        <Stack.Screen name="profile" options={{title: 'Profile Settings', presentation: 'card', headerShown: true, headerBackVisible: true, headerBackButtonDisplayMode: 'minimal'}} />
      </Stack>
    )}

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

