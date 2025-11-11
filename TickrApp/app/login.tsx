import { ImageBackground, View, StyleSheet, Text, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator, Button, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Image } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig';





export default function LoginScreen() {
    const router = useRouter();

    //Controlled inputs and UI states
    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [error, setError] = React.useState<string>('');
    const [submitting, setSubmitting ] = React.useState<boolean>(false);

    //Mapping Firebase codes to messages
    const fError = (e: unknown): string => {
        const err = e as FirebaseError;
        switch (err.code) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Email or password is incorrect.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later.';
            default:
                return 'Something went wrong. Please try again.';
        }
    };

    const handleLogin = async () => {
        setError('');
        setSubmitting(true);
        try {
            // Attempt to sign in with email and password
            await signInWithEmailAndPassword(auth, email.trim(), password);

            // Navigate to the home screen on successful login 
            router.replace("/"); // Adjust the path as needed
        } catch (e) {
            setError(fError(e));
        } finally {
            setSubmitting(false);
        }
    };

    // Check if the form can be submitted
    const canSubmit = email.length > 0 && password.length >= 6 && !submitting;
    if (submitting) {
        return <Text>Loading...</Text>;
    }

  return (

    Platform.OS === "web" ? (
        //Web view
        <View style = {[styles.container, styles.webContainer]}>
            <Image source = {require('../assets/images/TICKR_Icon.png')} style = {styles.icon} />
            <Text style={styles.title}>Welcome To Tickr</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Email field */} 
            <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!submitting}
            />
            {/* Password Field */} 
            <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!submitting}
            />
            {/* Login Button */}
            {submitting ? (
                <ActivityIndicator />
            ) : (
                <Button title="Login" onPress={handleLogin} disabled={!canSubmit} />
            )}
            {/* Signup and Forgot Password Links */}
            <View style={{ height: 12}} />
            <TouchableOpacity onPress={() => router.replace("/signup")}>
                <Text style={styles.link}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
                <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>

            <Text style={styles.copyrightText}>Copyright © 2025 Jared Gilbert. All rights reserved.</Text>
            <Text style={styles.copyrightText}>Unauthorized copying or distribution of this software, via any medium, is strictly prohibited.</Text>
        </View>
    ) : (
        //Mobile view
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={{flex: 1 }}
            >
                <View style={styles.container}>
                    <Image source = {require('../assets/images/TICKR_Icon.png')} style = {styles.icon} />
                    <Text style={styles.title}>Welcome To Tickr</Text>
        
                    {error ? <Text style={styles.error}>{error}</Text> : null}
        
                    {/* Email field */} 
                    <TextInput
                    style={styles.input}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    editable={!submitting}
                    />

                    {/* Password Field */} 
                    <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!submitting}
                    />

                    {/* Login Button */}
                    {submitting ? (
                        <ActivityIndicator />
                    ) : (
                        <Button title="Login" onPress={handleLogin} disabled={!canSubmit} />
                    )}

                    {/* Signup and Forgot Password Links */}
                    <View style={{ height: 12}} />
                    <TouchableOpacity onPress={() => router.replace("/signup")}>
                        <Text style={styles.link}>Don't have an account? Sign up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
                        <Text style={styles.link}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <View style={styles.copyrightContainer}>
                        <Text style={styles.copyrightText}>Copyright © 2025 Jared Gilbert. All rights reserved.</Text>
                        <Text style ={styles.copyrightText}>Unauthorized copying or distribution of this software, via any medium, is strictly prohibited.</Text>
                    </View>
                    
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
  )
}





const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    webContainer: {flex: 1, maxWidth: 800, alignSelf: 'center', width: '100%', paddingHorizontal: 30  },
    title: { fontSize: 22, fontWeight: '600', marginBottom: 16, textAlign: 'center', },
    input: {color: '#000', borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 6, borderRadius: 8 },
    error: { color: 'red', marginBottom: 8, textAlign: 'center' },
    link: { color: "blue", marginTop: 10, textAlign: "center" },
    icon: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 },
    copyrightText: { fontSize: 12, color: '#888', textAlign: 'center' },
    copyrightContainer: { position: 'absolute', bottom: 50, alignSelf: 'center', width: '90%'},
})