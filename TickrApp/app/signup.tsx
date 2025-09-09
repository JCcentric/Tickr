import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator, Button, TouchableOpacity, Keyboard } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '@/firebaseConfig';
import { TouchableWithoutFeedback } from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function SignUpPage() {

        //Controlled inputs and UI states
        const router = useRouter();
        const [firstName, setFirstName] = React.useState<string>('');
        const [lastName, setLastName] = React.useState<string>('');
        const [email, setEmail] = React.useState<string>('');
        const [password, setPassword] = React.useState<string>('');
        const [confirmPassword, setConfirmPassword] = React.useState<string>('');
        const [error, setError] = React.useState<string>('');
        const [submitting, setSubmitting ] = React.useState<boolean>(false);    


        const fError = (e: unknown): string => {
        const err = e as FirebaseError;
        switch (err.code) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/email-already-in-use':
                return 'This email is already in use.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            default:
                return 'Something went wrong. Please try again.';
            }
        };


        const handleSignUp = async () => {
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }

            setError('');
            setSubmitting(true);
            try {

                //Create user in firebase Authentication
                const userCredentials = await createUserWithEmailAndPassword(auth, email.trim(), password);
                const user = userCredentials.user;

                // Save user profile in Firestore
                await setDoc(doc (db, "users", user.uid), {
                    firstName,
                    lastName,
                    email: email.trim(),
                    createdAt: serverTimestamp()
                })

                //Navigate to the home page
                router.replace('/');
            } catch (e) {
                setError(fError(e));
            } finally {
                setSubmitting(false);  
            }
        }

        const canSubmit = 
            firstName.length > 0 && 
            lastName.length > 0 && 
            email.length > 0 && 
            password.length >= 6 && 
            confirmPassword === password && 
            !submitting;   

        if (submitting) {
            return <Text>Loading...</Text>
        }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
            <Text style={styles.title}> Create an Account </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Form inputs for first name, last name, email, password, and confirm password */}
            <View style={styles.nameInputContainer}>
                <TextInput
                    style={styles.nameInput}
                    placeholder="First Name"
                    autoCapitalize="none"
                    keyboardType="default"
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={!submitting}
                />
                <TextInput
                    style={styles.nameInput}
                    placeholder="Last Name"
                    autoCapitalize="none"
                    keyboardType="default"
                    value={lastName}
                    onChangeText={setLastName}
                    editable={!submitting}
                />
            </View>
            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!submitting}
                />
            <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!submitting}
            />
            <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!submitting}
            />

            {/* Login Button */}
            {submitting ? (
                <ActivityIndicator />
            ) : (
                <Button title="Sign Up" onPress={handleSignUp} disabled={!canSubmit} />
            )}
            
            <TouchableOpacity onPress={() => router.replace('/login')}>
                    <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>

        </View>
    </TouchableWithoutFeedback>
    
  )
}

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
    nameInputContainer: {width: '80%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20},
    nameInput: {marginHorizontal: 0, height: 40, width: 150, borderColor: 'gray', borderWidth: 1, paddingHorizontal: 10, borderRadius: 5},
    input: {height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 10, width: '100%', borderRadius: 5},
    title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
    error: {color: 'red', marginBottom: 8, textAlign: 'center'},
    link: { color: "blue", marginTop: 10, textAlign: "center" }
})