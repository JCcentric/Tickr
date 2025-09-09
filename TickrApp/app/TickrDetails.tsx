import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getDownloadURL, getStorage, ref } from 'firebase/storage'


const { height } = Dimensions.get('window')

export default function TickrDetails() {
    const router = useRouter();
    const { title = '', description = '', date = '', image = '', id = '' } = useLocalSearchParams();
    const rawImage = Array.isArray(image) ? image[0] : image;

    const [timeLeft, setTimeLeft] = useState(getTimeLeft());
    const [imageURL, setImageURL] = useState<string | null>(null);
    
    


    //Get image
    useEffect(() => {
        if (!rawImage) return;

        const storage = getStorage();
        const imageRef = ref(storage, rawImage);

        getDownloadURL(imageRef)
            .then(url => {
                setImageURL(url);  
            })
            .catch((error) => {
                console.error('Failed to get download URL:', error);
            });
    }, [rawImage]);




    // Calculate time left until the event date
    function getTimeLeft() {
      const eventDate = new Date(Array.isArray(date) ? date[0] : date).getTime();
      const now = new Date().getTime();
      const diff = eventDate - now;

      if (diff <= 0) return "Event passed";

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }

    // Update time left every second
    useEffect(() => {
      const interval = setInterval(() => {
        setTimeLeft(getTimeLeft());
      }, 1000);

      return () => clearInterval(interval);
    }, [date]);

    console.log('Image param:', image);


  return (
    <SafeAreaView style={styles.container}>
        {imageURL ? (
            <ImageBackground source={{ uri: imageURL }} style={styles.imageBackground} imageStyle={{ resizeMode: 'cover' }} blurRadius={3}>
                <View style={styles.overlay}>
                    {/* Edit Button */}
                    <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push({ pathname: '/EditTickr', params: { id, title, description, date, image } })}
                    >
                        <Ionicons name="create-outline" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Description */}
                    <Text style={styles.description}>{description}</Text>

                    {/* Timer */}
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>
                        {typeof timeLeft === 'string'
                            ? timeLeft
                            : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        ) : (
            <View style={styles.noImageBackground}>
                {/* Edit Button */}
                <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push({ pathname: '/EditTickr', params: { id, title, description, date, image } })}
                >
                    <Ionicons name="create-outline" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Description */}
                <Text style={styles.description}>{description}</Text>

                {/* Timer */}
                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                    {typeof timeLeft === 'string'
                        ? timeLeft
                        : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
                    </Text>
                </View>
            </View>
        )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#130b16',
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noImageBackground: {
    flex: 1,
    backgroundColor: '#130b16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: '#f1f1f1',
    textAlign: 'center',
    marginBottom: 20,
  },
  timerContainer: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#a60fdc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },


})