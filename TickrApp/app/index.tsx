import { Text, Platform, useWindowDimensions, ActivityIndicator, StyleSheet, View, TouchableOpacity, FlatList, TextInput, Image, TouchableWithoutFeedback, Keyboard, Animated, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { LinearGradient } from 'expo-linear-gradient';
import TickrCard from '@/components/TickrCard';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tickrs, setTickrs] = useState<any[]>([]);
  const [filteredTickrs, setFilteredTickrs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const scaleValue = new Animated.Value(1);
  const insets = useSafeAreaInsets();

  // Determine screen size for responsive design for web and mobile
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = isWeb && width > 800;
  const profileSize = width < 380 ? 40 : 50;

  useEffect(() => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  // Subscribe to changes in the user document
  const unsubscribe = onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.profilePicture) {
        setProfilePic(data.profilePicture);
      }
    }
  }, (err) => {
    console.error("Error fetching profile picture:", err);
  });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {toValue: 1.05, useNativeDriver: true}).start();
  }

  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start();
  };



  // Fetch tickrs from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const tickrRef = collection(db, "users", user.uid, "tickrs");
    const q = query(tickrRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tickrList = snapshot.docs.map(doc => {
        const data = doc.data();

          let normalizedDate: string | null = null;
          if (data.date) {
            if (typeof data.date.toDate === "function") {
              // Firestore Timestamp
              normalizedDate = data.date.toDate().toISOString();
            } else if (data.date instanceof Date) {
              // Already a JS Date
              normalizedDate = data.date.toISOString();
            } else if (typeof data.date === "string") {
              // Already stored as a string
              normalizedDate = data.date;
            }
          }

          return {
            id: doc.id,
            ...data,
            date: normalizedDate, // convert Timestamp → ISO string
          };
      });
      setTickrs(tickrList);
      setFilteredTickrs(tickrList);
    }, (error) => {
      console.error("Error fetching tickrs:", error);
    });

    return () => unsubscribe();
  }, []);




  //Search Functionality
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


  // Clear search input
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredTickrs(tickrs);
  };


  //Delete Functionality
  const deleteTickr = async (tickrId: string, imagePath?: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Delete image from Firebase Storage if exists
      if (imagePath) {
        const storageRef = ref(getStorage(), imagePath);
        await deleteObject(storageRef);
        console.log(`${imagePath} deleted successfully`);
        } 

      // Delete Firestore document
      const tickrDocRef = doc(db, "users", user.uid, "tickrs", tickrId);
      await deleteDoc(tickrDocRef);

      // Update local state
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


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  //profile picture size adjustment based on screen size
  const dynamicProfileIconStyle = {
    position: "absolute",
    top: insets.top + 3,
    right: 15,
    zIndex: 10,
    padding: 3,
  } as const;



  return (

    //Web View
    Platform.OS === "web" ? (
      <View style = {[styles.container, styles.webContainer]}>

        <Text style={styles.title}>Your Tickrs</Text>

          {/*Profile Button*/} 
          <TouchableOpacity style={styles.profileIconWeb} onPress={() => router.push("/profile")}>
            {profilePic ? (
              <Image 
              source={{ uri: profilePic }} 
              style={styles.profileImageWeb}
              />
            ) : ( 
                <Ionicons name="person-circle-outline" size={45} color="#888" />
            )}
          </TouchableOpacity>
          
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
          
          {/* Tickr List */}
          <View style={{ flex: 1 }}>
            {filteredTickrs.length === 0 ? (
              <Text style={styles.noTickr}>No tickrs found.</Text>
            ) : (
              <FlatList
                style={styles.flatList}
                data={filteredTickrs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Swipeable renderRightActions={() => renderRightActions(item.id, item.imagePath)}>
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
          </View>
          {/* Floating Action Button - Create Tickr */}
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.fab} onPress={() => router.push("/CreateTickr")}>
              <Ionicons name="add" size={28} color={'#fff'}></Ionicons>
            </TouchableOpacity>
          </Animated.View>
      </View>
    ) : (
      //Mobile view
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors ={['#004d59', '#012d34']} style = {{flex: 1}}>
        <SafeAreaView style={[styles.container, isWeb && styles.webContainer]}>


          <Text style={styles.title}>Your Tickrs</Text>

          {/*Profile Button*/} 
          <TouchableOpacity style={dynamicProfileIconStyle} onPress={() => router.push("/profile")}>
            {profilePic ? (
              <Image 
              source={{ uri: profilePic }} 
              style={styles.profileImage}
              />
            ) : ( 
                <Ionicons name="person-circle-outline" size={45} color="#888" />
            )}
          </TouchableOpacity>
          
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
          
          {/* Tickr List */}
          <View style={{ flex: 1 }}>
            {filteredTickrs.length === 0 ? (
              <Text style={styles.noTickr}>No tickrs found.</Text>
            ) : (
              <FlatList
                style={styles.flatList}
                data={filteredTickrs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Swipeable renderRightActions={() => renderRightActions(item.id, item.imagePath)}>
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
          </View>
          {/* Floating Action Button - Create Tickr */}
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.fab} onPress={() => router.push("/CreateTickr")}>
              <Ionicons name="add" size={28} color={'#fff'}></Ionicons>
            </TouchableOpacity>
          </Animated.View>
          
        </SafeAreaView>
        </LinearGradient>
      </TouchableWithoutFeedback>
    )
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, justifyContent: "flex-start" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: Platform.OS === 'web' ? 40 : 24, marginTop: 10, fontWeight: "bold", textAlign: "center", color: '#000' },
  noTickr: { textAlign: "center", marginTop: 20, color: "gray" },
  flatList: { flex: 1, marginTop: 20, marginHorizontal: 15 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#0B6162",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
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
    marginTop: 20,
    marginHorizontal: 20,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000"
  },
  profileImage: { 
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00bfa5',
    shadowColor: '#00bfa5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  profileIconWeb: {
    position: "absolute",
    top: 20,
    right: 35,
    padding: 5,
  },
  profileImageWeb: {
    width: 55,
    height: 55,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#00bfa5',
    shadowColor: '#00bfa5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  webContainer: { flex: 1, maxWidth: 800, alignSelf: "center", width: "100%", paddingHorizontal: 30},
});

