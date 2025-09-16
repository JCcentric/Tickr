import { 
  Platform, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Image, 
  ActivityIndicator, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { auth, db } from '@/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from 'firebase/storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function EditTickr() {
  const router = useRouter();
  const storage = getStorage();
  const user = auth.currentUser;

  // Grab params passed from TickrCard
  const { 
    id, 
    title: initialTitle = '', 
    description: initialDescription = '', 
    date: initialDate = '', 
    imageUrl: rawImageUrl = '' 
  } = useLocalSearchParams();

  // Normalize imageUrl param
  const initialImageUrl = Array.isArray(rawImageUrl) ? rawImageUrl[0] : rawImageUrl;

  const [title, setTitle] = useState(initialTitle as string);
  const [description, setDescription] = useState(initialDescription as string);
  const [date, setDate] = useState(initialDate ? new Date(initialDate as string) : new Date());
  const [image, setImage] = useState<string | null>(null); // only store NEW image if picked
  const [isDatePickervisible, setDatePickerVisible] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pick new image
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access gallery is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Upload to Firebase
  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `${encodeURIComponent(user?.uid || 'unknown')}-${Date.now()}.jpg`;
    const storageRef = ref(storage, `tickrImages/${fileName}`);
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    return await getDownloadURL(storageRef);
  };

  // Delete old Firebase image if replaced
  const deleteOldImage = async (url: string) => {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    } catch (error) {
      console.warn('Old image delete failed (may not exist):', error);
    }
  };

  // Save updates
  const updateTickr = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let updatedImageUrl = initialImageUrl; // keep the original if no new image

      if (image) {
        // If user picked a new one → delete old and upload new
        if (initialImageUrl) await deleteOldImage(initialImageUrl);
        updatedImageUrl = await uploadImage(image);
      }

      const tickrDoc = doc(db, 'users', user.uid, 'tickrs', id as string);
      await updateDoc(tickrDoc, {
        title,
        description,
        date: Timestamp.fromDate(date),
        imageUrl: updatedImageUrl || null,
      });

      router.back();
    } catch (e) {
      console.error('Update Tickr failed:', e);
      setError('Failed to update Tickr. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Tickr</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Title */}
        <TextInput
          style={styles.input}
          placeholder="Tickr Title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <TextInput
          style={styles.input}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
        />

        {/* Date */}
        <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisible(true)}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.dateText}>Date: {date.toDateString()}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          textColor="#000"
          isVisible={isDatePickervisible}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          date={date}
          onConfirm={(selectedDate) => { setDatePickerVisible(false); setDate(selectedDate); }}
          onCancel={() => setDatePickerVisible(false)}
        />

        {/* Image Picker */}
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={20} color="#fff" />
          <Text style={styles.imageText}>{image ? 'Change Image' : 'Change Existing Image'}</Text>
        </TouchableOpacity>

        {/* Show preview */}
        {image || initialImageUrl ? (
          <Image source={{ uri: image || initialImageUrl! }} style={styles.previewImage} />
        ) : (
          <View style={[styles.previewImage, { backgroundColor: "#ccc", justifyContent: "center", alignItems: "center" }]}>
            <Ionicons name="image-outline" size={40} color="#666" />
          </View>
        )}

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={updateTickr} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Update Tickr</Text>}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c63ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: { color: '#fff', fontSize: 16 },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a60fdc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageText: { color: '#fff', fontSize: 16 },
  previewImage: { width: '100%', height: 150, borderRadius: 8, marginBottom: 12 },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
