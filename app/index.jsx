import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';

const images = [
  require('../assets/camera.png'),
  require('../assets/people.png'),
  require('../assets/animal.png')
];

const LandingScreen = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Transforming Vision into Intelligence!';

  // Image carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* LOGO */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo2.jpg')}
          style={styles.logo}
        />
        <Text style={styles.logoText}>INSIGHTIX</Text>
      </View>

      {/* HERO */}
      <Text style={styles.title}>{displayedText}</Text>

      <Text style={styles.description}>
        Insightix is an AI-powered solution designed to detect human activities,
        behaviors, and perform human counting and footfall analysis using
        IoT and deep learning technologies.
      </Text>

      <Image
        source={images[currentImage]}
        style={styles.heroImage}
      />

      {/* CTA */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.ctaText}>Get Started</Text>
      </TouchableOpacity>

      {/* FEATURES */}
      <Text style={styles.sectionTitle}>Key Features</Text>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>👤 Human Detection</Text>
        <Text style={styles.featureText}>
          Detect human presence and analyze footfall accurately.
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>📦 Object Detection</Text>
        <Text style={styles.featureText}>
          Identify and classify objects in real time.
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>🚨 Alerts</Text>
        <Text style={styles.featureText}>
          Get instant alerts for important events.
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>📊 Real-time Insights</Text>
        <Text style={styles.featureText}>
          Live analytics to support better decisions.
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>⚙️ Custom Settings</Text>
        <Text style={styles.featureText}>
          Configure cameras and detection rules.
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>🏢 Space Utilization</Text>
        <Text style={styles.featureText}>
          Optimize space usage using AI analytics.
        </Text>
      </View>
    </ScrollView>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },

  logoContainer: {
    flexDirection: 'row',      
    alignItems: 'center',      
    justifyContent: 'center',  
    marginBottom: 20
  },

  logo: {
    width: 55,
    height:55,
    resizeMode: 'contain',
    marginTop: 25,
    marginLeft: -25,
  },
  logoText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 25,
    color: '#125049',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#0F312D',
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22
  },
  heroImage: {
    width: '100%',
    height: 220,
    resizeMode: 'contain',
    marginBottom: 20
  },
  ctaButton: {
    backgroundColor: '#125049',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15
  },
  featureCard: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4
  }
});
