import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../src/Services/api';
import { FontAwesome } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const res = await API.get('/devices');
      setDevices(res.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load devices');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/');
          }
        }
      ],
      { cancelable: true }
    );
  };

  const handleEdit = (device) => {
    router.push({
      pathname: '/add-device',
      params: { device: JSON.stringify(device) },
    });
  };

  const renderDevice = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceLocation}>{item.location}</Text>
        <Text style={styles.deviceId}>ID: {item._id}</Text>
        <Text style={styles.deviceIp}>IP: {item.ip}</Text>
        <Text style={styles.deviceUrl} numberOfLines={1}>
          {item.url}
        </Text>
      </View>

      <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
        <FontAwesome name="edit" size={18} color="#fff" />
        <Text style={styles.editText}>Update</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.empty}>No devices found</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* FIXED HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Camera Settings</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="person-circle-outline" size={30} color="#0F312D" />
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE CONTENT */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#125049" />
          <Text style={styles.loadingText}>Loading devices...</Text>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item._id}
          renderItem={renderDevice}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#125049',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceInfo: {
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  deviceLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  deviceId: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  deviceIp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  deviceUrl: {
    fontSize: 12,
    color: '#1e40af',
    marginTop: 4,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#125049',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
