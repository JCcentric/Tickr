import { Text, ActivityIndicator, StyleSheet, View, TouchableOpacity, FlatList, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from "firebase/storage";
import TickrCard from '@/components/TickrCard';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tickrs, setTickrs] = useState<any[]>([]);
  const [filteredTickrs, setFilteredTickrs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const tickrRef = collection(db, "users", user.uid, "tickrs");
    const q = query(tickrRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tickrList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTickrs(tickrList);
      setFilteredTickrs(tickrList);
    }, (error) => {
      console.error("Error fetching tickrs:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text === "") {
      setFilteredTickrs(tickrs);
    } else {
      const filtered = tickrs.filter(item =>
        item.title?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredTickrs(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredTickrs(tickrs);
  };

  const deleteTickr = async (tickrId: string, imageUrl?: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      if (imageUrl) {
        const storage = getStorage();
        const path = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
      }

      const tickrDocRef = doc(db, "users", user.uid, "tickrs", tickrId);
      await deleteDoc(tickrDocRef);
      setTickrs(prev => prev.filter(t => t.id !== tickrId));
      setFilteredTickrs(prev => prev.filter(t => t.id !== tickrId));

    } catch (error) {
      console.error("Error deleting tickr:", error);
    }
  };

  const renderRightActions = (tickrId: string, imageUrl?: string) => {
    return (
      <TouchableOpacity
        style={styles.swipeDelete}
        onPress={() => deleteTickr(tickrId, imageUrl)}
      >
        <Ionicons name="trash-outline" size={28} color="#fff" />
      </TouchableOpacity>
    );
  };

  // ✅ Export to Excel
  const exportToExcel = async () => {
    try {
      if (tickrs.length === 0) {
        Alert.alert("No data", "There are no tickrs to export.");
        return;
      }

      // Prepare data for Excel
      const data = tickrs.map((item, index) => ({
        "No.": index + 1,
        "Title": item.title || "",
        "Description": item.description || "",
        "Date Created": new Date(item.date).toLocaleDateString(),
        "Image URL": item.imageUrl || ""
      }));

      // Create worksheet and workbook
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tickrs");

      // Convert workbook to binary string
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      // Create file path
      const fileUri = FileSystem.documentDirectory + "tickrs_report.xlsx";

      // Write the file
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Share file
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      Alert.alert("Error", "Failed to export report.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Tickrs</Text>
    
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tickrs..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Export Button */}
        <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.exportText}> Export Report</Text>
        </TouchableOpacity>
        
        {/* Tickr List */}
        {filteredTickrs.length === 0 ? (
          <Text style={styles.noTickr}>No tickrs found.</Text>
        ) : (
          <FlatList
            style={styles.flatList}
            data={filteredTickrs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Swipeable renderRightActions={() => renderRightActions(item.id, item.image)}>
                <TickrCard
                  title={item.title}
                  description={item.description}
                  date={item.date}
                  image={item.imageUrl}
                  onPress={() =>
                    router.push({
                      pathname: '/TickrDetails',
                      params: {
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        date: item.date,
                        image: item.imageUrl || ''
                      }
                    })
                  }
                />
              </Swipeable>
            )}
          />
        )}
  
        <TouchableOpacity style={styles.fab} onPress={() => router.push("/CreateTickr")}>
          <Ionicons name="add" size={28} color={'#fff'}></Ionicons>
        </TouchableOpacity>
      
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: 50, backgroundColor: "#f9f9f9" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: '#000' },
  noTickr: { textAlign: "center", marginTop: 20, color: "gray" },
  flatList: { flex: 1, marginTop: 20 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#a60fdc",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  signOutButton: {
    position: "absolute",
    top: 15,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
  },
  signOutText: { color: "#fff", fontWeight: "bold" },
  swipeDelete: {
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '90%',
    borderRadius: 12,
    marginVertical: 0,
    marginRight: 16
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000"
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: "center"
  },
  exportText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});
