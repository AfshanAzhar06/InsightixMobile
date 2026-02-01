import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import API from '../src/Services/api';
import AlertChecker from '../components/AlertChecker';

const AlertScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Unauthorized', 'Please login first');
      router.replace('/login');
      return;
    }
    fetchAlerts();
  };

  const fetchAlerts = async () => {
    try {
      const res = await API.get('/alerts');
      setAlerts(res.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Alert', 'Are you sure you want to delete this alert?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await API.delete(`/alerts/${id}`);
            setAlerts(prev => prev.filter(a => a._id !== id));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete alert');
          }
        }
      }
    ]);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const renderAlert = ({ item }) => (
    <View style={styles.card}>
      <FontAwesome name="exclamation-triangle" size={24} color="#d90429" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.meta}>Device: {item.deviceId?.name || 'Unknown'}</Text>
        <Text style={styles.meta}>Location: {item.deviceId?.location || 'Unknown'}</Text>
        <Text style={styles.meta}>Time: {new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <FontAwesome name="trash" size={22} color="#d90429" />
      </TouchableOpacity>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logout}>Logout</Text></TouchableOpacity>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item._id}
        renderItem={renderAlert}
        ListEmptyComponent={<Text style={styles.empty}>No alerts found</Text>}
      />

      {/* Optionally show AlertChecker for utilization popups */}
      {alerts.map(alert => (
        <AlertChecker key={alert._id} utilization={alert.utilization} deviceId={alert.deviceId?._id} />
      ))}
    </View>
  );
};

export default AlertScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  logout: { color: 'red', fontWeight: 'bold' },
  card: { flexDirection: 'row', backgroundColor: '#f2f2f2', padding: 12, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  type: { fontSize: 16, fontWeight: 'bold' },
  message: { fontSize: 14, marginVertical: 4 },
  meta: { fontSize: 12, color: '#555' },
  empty: { textAlign: 'center', marginTop: 20, color: '#666' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
