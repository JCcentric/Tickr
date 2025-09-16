import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'

type TickrCardProps = {
  title: string;
  description: string;
  date: string;
  image?: string;
  onPress: (data: { title: string; description: string; date: string; image?: string }) => void;
}

const TickrCard: React.FC<TickrCardProps> = ({ title, description, date, image, onPress }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  // Calculate time left until the event date
  function getTimeLeft() {
    const eventDate = new Date(date).getTime();
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

  return (
    <TouchableOpacity onPress={() => onPress({ title, description, date, image })} activeOpacity={0.8}>
      <View style={styles.card}>
      {image ? (
        <ImageBackground source={{ uri: image }} style={styles.image}>
          <View style={styles.overlay}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
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
        <View style={styles.noImageContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {typeof timeLeft === 'string'
                ? timeLeft
                : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
            </Text>
          </View>
        </View>
      )}
    </View>
    </TouchableOpacity>
    
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden', // ensures image corners match card
  },
  image: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
    opacity: 0.8,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 12,
  },
  content: {
    padding: 16,
  },
  noImageContent: {
    padding: 16,
    backgroundColor: '#130b16ff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    color: '#fff',
    marginBottom: 8,
  },
  timerContainer: {
    backgroundColor: '#0B6162',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TickrCard;
