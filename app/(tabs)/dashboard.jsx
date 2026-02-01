import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import API from '../../src/Services/api';
import Header from '../../components/header'; 

const { width } = Dimensions.get('window');
const cardWidth = width - 30; 

const DashboardScreen = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh images every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(prev => prev + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  // Auth check + fetch devices
  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Unauthorized', 'Please login first');
      router.replace('/');
      return;
    }
    fetchDevices();
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await API.get('/devices');
      setDevices(res.data || []);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = (deviceId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await API.delete(`/devices/${deviceId}`);
              fetchDevices();
            } catch {
              Alert.alert('Error', 'Delete failed');
            }
          }
        }
      ]
    );
  };

  const openLiveVideo = (device) => {
    router.push({
      pathname: '/LiveVedioScreen',
      params: { device: JSON.stringify(device) }
    });
  };

  const getVideoSource = (device) => {
    if (device.url) {
      return {
        uri: `http:///192.168.0.109:5001/stream_from_react?url=${encodeURIComponent(device.url)}&t=${refreshKey}`
      };
    }
    return null;
  };

  const renderDevice = ({ item }) => {
    const videoSource = getVideoSource(item);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openLiveVideo(item)}
        activeOpacity={0.8}
      >
        {videoSource ? (
          <Image source={{ uri: videoSource.uri }} style={styles.video} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderVideo}>
            <Text style={styles.placeholderText}>📹</Text>
            <Text style={styles.placeholderSubtext}>No Stream</Text>
          </View>
        )}

        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteIconBtn}
          onPress={() => handleDeleteDevice(item._id)}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Feed info */}
        <View style={styles.feedInfo}>
          <Text style={styles.feedName}>{item.location || item.name}</Text>
          <Text style={styles.feedNumber}>Feed {devices.indexOf(item) + 1}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* REUSABLE HEADER */}
      <Header />

      {/* DEVICE LIST */}
      {loading ? (
        <Text style={styles.emptyText}>Loading...</Text>
      ) : devices.length === 0 ? (
        <Text style={styles.emptyText}>No devices found</Text>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item._id}
          renderItem={renderDevice}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 15, paddingBottom: 20 },

  card: {
    width: cardWidth,
    backgroundColor: '#000',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    height: 220,
  },
  video: { width: '100%', height: '100%' },
  placeholderVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#fff', fontSize: 36, marginBottom: 4 },
  placeholderSubtext: { color: '#999', fontSize: 12 },
  deleteIconBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(220,53,69,0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: { fontSize: 16, color: '#fff' },
  feedInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  feedName: { color: '#fff', fontSize: 14 },
  feedNumber: { color: '#22c55e', fontSize: 14, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
});
