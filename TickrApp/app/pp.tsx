import { StyleSheet, Text, ScrollView, Linking } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

export default function PP() {
  const router = useRouter();

  const openFirebasePrivacyPolicy = () => {
    Linking.openURL('https://policies.google.com/privacy');
  }

  return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tickr – Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: November 10, 2025</Text>

        <Text style={styles.section}>
          This Privacy Policy describes how Tickr ("the App") and its developer, Jared Gilbert, collect, 
          use, and protect your information. By using Tickr, you consent to the practices described here.
        </Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.section}>
          Tickr uses Firebase services to provide functionality, including:
          {"\n"}• Firebase Authentication
          {"\n"}• Firebase Firestore / Realtime Database
          {"\n"}• Firebase Analytics
          {"\n"}• Firebase Cloud Storage
          {"\n\n"}Through these services, your data may be stored and processed in accordance with Firebase's privacy policies.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Data</Text>
        <Text style={styles.section}>
          We use the information collected to:
          {"\n"}• Authenticate users
          {"\n"}• Store user-generated countdown timers
          {"\n"}• Improve app functionality through analytics
          {"\n"}• Ensure security and prevent abuse
        </Text>

        <Text style={styles.heading}>3. Data Sharing</Text>
        <Text style={styles.section}>
          We do not sell or share your personal information for marketing purposes.  
          However, information may be stored and processed by Firebase according to their policies.
        </Text>

        <Text style={styles.heading}>4. Firebase Privacy Policy</Text>
        <Text style={styles.section}>
          By using this app, you acknowledge that Firebase may process and store data.  
          You can view Firebase's Privacy Policy here:{" "}
          <Text style={styles.link} onPress={openFirebasePrivacyPolicy}>
            https://policies.google.com/privacy
          </Text>
        </Text>

        <Text style={styles.heading}>5. Data Security</Text>
        <Text style={styles.section}>
          We take reasonable measures to protect your information. However, no system is completely secure, 
          and we cannot guarantee absolute security of your data.
        </Text>

        <Text style={styles.heading}>6. Your Responsibilities</Text>
        <Text style={styles.section}>
          Do not use Tickr to store sensitive information, including Controlled Unclassified Information (CUI) or classified data.
        </Text>

        <Text style={styles.heading}>7. Changes to This Policy</Text>
        <Text style={styles.section}>
          We may update this Privacy Policy at any time. Continued use of Tickr after changes constitutes your acceptance.
        </Text>
      </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  section: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
    },
})
