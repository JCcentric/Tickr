import { Alert, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-gesture-handler'
import { auth } from '@/firebaseConfig'
import { sendPasswordResetEmail } from 'firebase/auth';

export default function forgotPassword() {



    //Change Password function
      const handleChangePassword = async () => {
        try{
          if (auth.currentUser?.email) {
            await sendPasswordResetEmail(auth, auth.currentUser.email);
            Alert.alert("Password Reset", "A password reset email has been sent to your email address.");
          } else{
            Alert.alert("Error", "No email associated with this account.");
          }
        } catch (error) {
          console.error("Password reset error:", error);
          Alert.alert("Error", "Unable to send password reset email.");
        } 
      };





  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Reset your Password</Text>
          <Text style={styles.title}>Enter the email address associated with your account, and we’ll send you a link to reset your password. Check your inbox (and spam folder) for the reset email. It may take up to 10 minutes to receive the reset link.</Text>
    
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value='emailAddress'
            autoCorrect={false} />  
        </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
    container: {   
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
      },
})