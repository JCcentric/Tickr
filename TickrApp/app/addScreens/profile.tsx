import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { auth } from '@/firebaseConfig';

export default function profile() {


    const signOut = async () => {
        try {
          await auth.signOut();
        } catch (error) {
          console.error("Sign out error:", error);
        }
    };



  return (
    <View style={styles.container}>
      <Text>This is just a place holder to put the profile page</Text>
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
    </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    signOutButton: {
        position: "absolute",
        bottom: 50,
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#ff4d4d",
        borderRadius: 8,
    },
    signOutText: { color: "#fff", fontWeight: "bold" },
})