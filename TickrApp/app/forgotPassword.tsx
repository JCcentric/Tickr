import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-gesture-handler'
import { auth } from '@/firebaseConfig'
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function forgotPassword() {
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState('');



    //Change Password function
      const handleChangePassword = async () => {
        try{
          if (!emailAddress) {
            Alert.alert("Error", "Please type a valid email address.");
            return;
          } 
          
          await sendPasswordResetEmail(auth, emailAddress.trim());
          Alert.alert("Success", "Password reset sent. If an account exists with that email, you will receive a password reset link shortly.");
          router.replace('/login');




        } catch (error) {
          console.error("Password reset error:", error);
          Alert.alert("Error", "Unable to send password reset email.");
        } 
      };





  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Reset your Password</Text>
          <Text style={styles.text}>Enter the email address associated with your account, and we’ll send you a link to reset your password. Check your inbox (and spam folder) for the reset email. It may take up to 10 minutes to receive the reset link.</Text>
    
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={emailAddress}
            onChangeText={setEmailAddress}
            autoCorrect={false} />  

            <TouchableOpacity onPress={handleChangePassword} style={styles.submitButton}>
              <Text style={styles.submitText}>Send Reset Link</Text>
            </TouchableOpacity>
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
    text: {
        fontSize: 16,
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
      submitButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
      },
      submitText: {
        fontSize: 16,
        color: "#374151",
      }
})