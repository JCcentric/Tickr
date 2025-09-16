import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db, storage } from "@/firebaseConfig";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import {getAuth, updatePassword, sendPasswordResetEmail} from "firebase/auth";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

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


// Delete Account Function
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
            if (!user) return;

            const uid = user.uid;

            // Get User doc reference from Firestore
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();

              // Delete profile picture if it exists
              if (userData.profilePicture) {
                try {
                  const profilePicRef = ref(storage, userData.profilePicture);
                  await deleteObject(profilePicRef);
                  console.log("Profile picture deleted from storage.");
                } catch (err) {
                  console.log(
                    "No profile picture to delete or error deleting:",
                    err instanceof Error ? err.message : err
                  );
                }
              }

              // Delete all tickrs and their associated images
              const tickrsRef = collection(db, "users", uid, "tickrs");
              const tickrsSnap = await getDocs(tickrsRef);

              const tickrDeletePromises = tickrsSnap.docs.map(async (tickrDoc) => {
                const tickrData = tickrDoc.data();
                if (tickrData.imagePath) {
                  try {
                    const tickrImageRef = ref(storage, tickrData.imagePath);
                    await deleteObject(tickrImageRef);
                    console.log(`Tickr image ${tickrData.imagePath} deleted from storage.`);
                  } catch (err) {
                    console.error("Error deleting tickr image:", err);
                  }
                }
                await deleteDoc(tickrDoc.ref);
              });

              await Promise.all(tickrDeletePromises);
              console.log("All tickrs deleted.");

              // Delete user document from Firestore
              await deleteDoc(userRef);
              console.log("User document deleted from Firestore.");
            }

            // Delete user from Firebase Auth last
            await user.delete();
            console.log("User account deleted from Auth.");

            // Route back to login page
            router.replace("/login");
          } catch (err) {
            console.error("Error deleting account:", err);
            Alert.alert("Error", "There was an issue deleting your account. Please try again.");
          }
        },
      },
    ]
  );
};



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




  //Set Profile picture function
  const handleChangeProfilePicture = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Ask for permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "You need to allow access to your photos.");
        return;
      }

      // Pick an image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;

      // Convert to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      const imagePath = `profilePictures/${user.uid}/profile.jpg`;
      const storageRef = ref(storage, imagePath);

      // Delete old profile picture if it exists
      if (userData?.profilePicture) {
        try {
          const oldRef = ref(storage, userData.profilePicture);
          await deleteObject(oldRef);
          console.log("Old profile picture deleted.");
        } catch (err) {
          console.log("No old profile picture to delete or error deleting:", err);
        }
      }

      // Upload new image
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { profilePicture: downloadURL }, { merge: true });

      // Update local state to refresh UI immediately
      setUserData((prev: any) => ({ ...prev, profilePicture: downloadURL }));

      Alert.alert("Success", "Profile picture updated!");
    } catch (err) {
      console.error("Error updating profile picture:", err);
      Alert.alert("Error", "Unable to update profile picture.");
    }
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
        <TouchableOpacity style={styles.profilePicContainer} onPress={handleChangeProfilePicture}>
          <Image
            source={{
              uri:
                userData?.profilePicture ||
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
        <TouchableOpacity style={styles.optionButton} onPress={handleChangePassword}>
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
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center'},
  input:{ borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 15, paddingVertical: 8, paddingHorizontal: 5 },

});
