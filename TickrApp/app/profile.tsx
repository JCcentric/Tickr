import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.replace("/login");
          return;
        }

        // Fetch user document from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          setUserData({
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ")[1] || "",
            email: user.email,
            profilePic: user.photoURL || null,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Unable to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert("Error", "Unable to sign out.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (user) {
                await user.delete();
                router.replace("/login");
              }
            } catch (error) {
              console.error("Delete account error:", error);
              Alert.alert("Error", "Unable to delete account.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a60fdc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.profilePicContainer}>
          <Image
            source={{
              uri:
                userData?.profilePic ||
                "https://via.placeholder.com/150/cccccc/000000?text=Profile",
            }}
            style={styles.profilePic}
          />
          <View style={styles.editIcon}>
            <Feather name="edit-2" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>
          {userData?.firstName} {userData?.lastName}
        </Text>
        <Text style={styles.email}>{userData?.email}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>Change Password</Text>
          <Feather name="lock" size={18} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, { borderColor: "red" }]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.optionText, { color: "red" }]}>
            Delete Account
          </Text>
          <Feather name="trash-2" size={18} color="red" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={handleSignOut}>
          <Text style={styles.optionText}>Sign Out</Text>
          <Feather name="log-out" size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileSection: { alignItems: "center", marginTop: 40 },
  profilePicContainer: { position: "relative" },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#e5e7eb",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0B6162",
    padding: 8,
    borderRadius: 20,
  },
  name: { marginTop: 15, fontSize: 22, fontWeight: "600", color: "#111827" },
  email: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  optionsContainer: { marginTop: 40, gap: 16 },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  optionText: { fontSize: 16, color: "#374151" },
});
