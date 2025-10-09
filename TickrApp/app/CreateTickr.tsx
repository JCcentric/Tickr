import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import React, { useState, forwardRef } from 'react';
import { useRouter } from 'expo-router';
import { auth, db } from '@/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"



export default function CreateTickr() {
    const router = useRouter();
    const user = auth.currentUser;
    const storage = getStorage();  
    
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [isDatePickervisible, setDatePickerVisible] = useState(false); 
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const CustomDateInput = forwardRef(({ value, onClick }: any, ref: any) => (
      <TextInput
        ref={ref}
        value={value}
        editable={false}
        {...(Platform.OS === 'web' ? {onClick} : {onPressIn: onClick})}
        style={{
          backgroundColor: '#6c63ff',
          color: '#fff',
          borderWidth: 0,
          borderRadius: 8,
          paddingVertical: 8,
          paddingHorizontal: 10,
          fontSize: 16,
          textAlign: 'center',
          width: 120,
          cursor: 'pointer',
        }}
      />
    ));

    // Pick image from gallery
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Permission to access gallery is required");
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

    // Upload image to Firebase Storage
    const uploadImage = async (uri: string): Promise<{ url: string; path: string }> => {
        try {
            const response = await fetch(uri);
            if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
            const blob = await response.blob();

            const fileName = `${encodeURIComponent(user?.uid || 'unknown')}-${Date.now()}.jpg`;
            const storagePath = `tickrImages/${fileName}`;
            const storageRef = ref(storage, storagePath);

            await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
            const url = await getDownloadURL(storageRef);

            return {url, path: storagePath};
        } catch (e) {
            console.error("Image upload failed: ", e);
            throw new Error('Image upload failed');
        }
    };

    // Save Tickr to Firestore
    const saveTickr = async () => {
        if (!title.trim()) { setError('Title is required'); return; }
        if (!date) { setError('Please select a valid date.'); return; }
        setError('');
        setLoading(true);

        try {
            type TickrData = {
                title: string;
                description: string;
                date: Timestamp;
                createAt: any;
                imageUrl?: string;
                imagePath?: string;
            };

            const tickrData: TickrData = {
                title,
                description,
                date: Timestamp.fromDate(date),
                createAt: serverTimestamp(),
            };

            if (image) {
                const uploadResult = await uploadImage(image);
                tickrData.imageUrl = uploadResult.url;
                tickrData.imagePath = uploadResult.path;
            }

            

            await addDoc(collection(db, "users", user?.uid, "tickrs"), tickrData);
            router.back();
        } catch (e) {
            console.error("Error adding Tickr: ", e);
            setError('Failed to save Tickr. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (


        Platform.OS === 'web' ? (
            <View style={styles.containerWeb}>
            <Text style={styles.title}>Create New Tickr</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {/* Title */}
            <TextInput
                style={styles.input}
                placeholder="Tickr Title"
                placeholderTextColor={"#888"}
                value={title}
                onChangeText={setTitle}
            />
            {/* Description */}
            <TextInput
                style={styles.input}
                placeholder="Description (optional)"
                placeholderTextColor={"#888"}
                value={description}
                onChangeText={setDescription}
            />
            {/* Date Picker */}
            <View style={styles.dateContainer}> 
                <Ionicons name="calendar" size={20} color="#fff" />
                <Text style={styles.dateLabel}>Date: {date.toDateString()}</Text> 
                <DatePicker
                    selected = {date}
                    onChange = {(selectedDate) => setDate(selectedDate!)}
                    dateFormat = "MM/dd/yyyy"
                    customInput = {<CustomDateInput />}
                    popperPlacement = "bottom"
                    portalId='root-portal'
                    popperContainer = {({ children }) => (
                        <View style = {{ zIndex: 999, backgroundColor: '#fff', position: 'relative' }}> {children} </View>
                    )}
                />
            </View>
            {/* Image Picker */}
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={20} color="#fff" />
                <Text style={styles.imageText}>{image ? "Change Image" : "Add Image (optional)"}</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.previewImage} />}
            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={saveTickr} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Tickr</Text>}
            </TouchableOpacity>
            </View>  
        ) : (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                <Text style={styles.title}>Create New Tickr</Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}

                {/* Title */}
                <TextInput
                    style={styles.input}
                    placeholder="Tickr Title"
                    placeholderTextColor={"#888"}
                    value={title}
                    onChangeText={setTitle}
                />
                {/* Description */}
                <TextInput
                    style={styles.input}
                    placeholder="Description (optional)"
                    placeholderTextColor={"#888"}
                    value={description}
                    onChangeText={setDescription}
                />

                {/* Date Picker */}
                <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisible(true)}>
                    <Ionicons name="calendar" size={20} color="#fff" /> 
                    <Text style={styles.dateText}> Date: {date.toDateString()}</Text>
                </TouchableOpacity>

                <View style={{justifyContent: 'center', alignItems: 'center'}}> 
                <DateTimePickerModal
                    textColor='#000'
                    isVisible={isDatePickervisible}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    date = {date}
                    onConfirm={(selectedDate) => { setDatePickerVisible(false); setDate(selectedDate); }}
                    onCancel={() => { setDatePickerVisible(false); }}
                />
                </View>

                {/* Image Picker */}
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                    <Ionicons name="image-outline" size={20} color="#fff" />
                    <Text style={styles.imageText}>{image ? "Change Image" : "Add Image (optional)"}</Text>
                </TouchableOpacity>
                {image && <Image source={{ uri: image }} style={styles.previewImage} />}

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={saveTickr} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Tickr</Text>}
                </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        )


        
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    containerWeb: {flex: 1, padding: 20, height: '100%', backgroundColor: '#fff', alignSelf: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginTop: 50, marginBottom: 50, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#acacacff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 12, marginBottom: 12, fontSize: 16 },
    error: { color: 'red', textAlign: 'center', marginBottom: 10 },
    dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6c63ff', padding: 12, borderRadius: 8, marginBottom: 12 },
    dateText: { color: '#fff', fontSize: 16 },
    imageButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#a60fdc', padding: 12, borderRadius: 8, marginBottom: 12 },
    imageText: { color: '#fff', fontSize: 16 },
    previewImage: { width: '100%', height: 150, borderRadius: 8, marginBottom: 12 },
    saveButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    saveText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    dateContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6c63ff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12, gap: 8},
    dateLabel: { color: '#fff', fontSize: 16}

});
