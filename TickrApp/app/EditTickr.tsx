import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { auth, db } from '@/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from 'firebase/storage';

export default function EditTickr() {
  const router = useRouter();
  const storage = getStorage();
  const user = auth.currentUser;

  // ✅ Pull params passed from TickrDetails
  const { id, title: initialTitle = '', description: initialDescription = '', date: initialDate = '', imageUrl: initialImageUrl = '' } = useLocalSearchParams();

  const [title, setTitle] = useState(initialTitle as string);
  const [description, setDescription] = useState(initialDescription as string);
  const [date, setDate] = useState(initialDate ? new Date(initialDate as string) : new Date());
  const [image, setImage] = useState<string | null>(null); // new image URI if user picks
  const [existingImageUrl, setExistingImageUrl] = useState(initialImageUrl as string); // existing image from Firestore
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Pick a new image
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

  // ✅ Upload new image to Firebase Storage
  const uploadImage = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${encodeURIComponent(user?.uid || 'unknown')}-${Date.now()}.jpg`;
      const storageRef = ref(storage, `tickrImages/${fileName}`);
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Image upload failed');
    }
  };

  // ✅ Delete old image from Firebase Storage
  const deleteOldImage = async (url: string) => {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
      console.log('Old image deleted successfully');
    } catch (error) {
      console.warn('Could not delete old image (might not exist):', error);
    }
  };

  // ✅ Update Tickr in Firestore
  const updateTickr = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let updatedImageUrl = existingImageUrl;

      // If user picked a new image → upload it and delete old one
      if (image) {
        if (existingImageUrl) {
          await deleteOldImage(existingImageUrl);
        }
        updatedImageUrl = await uploadImage(image);
      }

      const tickrDoc = doc(db, 'users', user.uid, 'tickrs', id as string);
      await updateDoc(tickrDoc, {
        title,
        description,
        date: date.toISOString(),
        imageUrl: updatedImageUrl,
      });

      router.back();
      router.back();
    } catch (error) {
      console.error('Error updating Tickr:', error);
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

        {/* Date Picker */}
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.dateText}>Date: {date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        {/* Image */}
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={20} color="#fff" />
          <Text style={styles.imageText}>{image ? 'Change Image' : 'Change Existing Image'}</Text>
        </TouchableOpacity>

        {/* Preview (new image OR existing) */}
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : existingImageUrl ? (
          <Image source={{ uri: existingImageUrl }} style={styles.previewImage} />
        ) : null}

        {/* Save Button */}
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
