import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import LiveStreamMobile from '../components/LiveStreamMobile';
import API from '../src/Services/api';
import * as ScreenOrientation from 'expo-screen-orientation';

const socket = io('http://192.168.0.109:5002');
const { width } = Dimensions.get('window');

/* ---------------- HEADER ---------------- */
const LiveHeader = ({ title }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#125049" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>

    <TouchableOpacity
      onPress={async () => {
        await AsyncStorage.clear();
        router.replace('/');
      }}
    >
      <Ionicons name="person-circle-outline" size={32} color="#0F312D" />
    </TouchableOpacity>
  </View>
);

/* ---------------- SCREEN ---------------- */
export default function LiveVideoScreen() {
  const params = useLocalSearchParams();
  const device = params.device ? JSON.parse(params.device) : null;

  const [entryCount, setEntryCount] = useState(0);
  const [exitCount, setExitCount] = useState(0);
  const [queueSize, setQueueSize] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const utilization = device?.spaceUtilization
    ? Math.min((entryCount / device.spaceUtilization) * 100, 100)
    : 0;

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    socket.on('count_update', (data) => {
      setEntryCount(data.entered || 0);
      setExitCount(data.exited || 0);
    });

    socket.on('queue_update', (data) => {
      setQueueSize(data.queue_size || 0);
    });

    socket.on('status_message', (data) => {
      if (data?.message && data.message !== 'All activities are normal') {
        Toast.show({
          type: 'error',
          text1: '⚠️ Alert',
          text2: data.message
        });
      }
    });

    return () => socket.removeAllListeners();
  }, []);

  if (!device) return <Text>No Device</Text>;

  /* ---------------- FULLSCREEN ---------------- */
  const openFullscreen = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    setFullscreen(true);
  };

  const closeFullscreen = async () => {
    setFullscreen(false);
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  };

  return (
    <View style={{ flex: 1 }}>
      <LiveHeader title={`Live — ${device.location}`} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* LIVE VIDEO PREVIEW */}
        <View style={styles.previewWrapper}>
          <LiveStreamMobile
            streamUrl={`http://192.168.0.109:5002/stream_from_react?url=${encodeURIComponent(
              device.url
            )}`}
            style={{ width: '100%', height: '100%' }}
          />

          <TouchableOpacity style={styles.fullscreenBtn} onPress={openFullscreen}>
            <MaterialCommunityIcons name="fullscreen" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* STATS CARDS */}
        <Row>
          <StatCard label="Entries" value={entryCount} />
          <StatCard label="Exits" value={exitCount} />
        </Row>

        <Row>
          <StatCard
            label="Utilization"
            value={`${utilization.toFixed(1)}%`}
            highlight={utilization >= 50}
          />
          <StatCard label="Queue" value={queueSize} />
        </Row>

        {/* DELETE DEVICE */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={async () => {
            await API.delete(`/devices/${device._id}`);
            router.replace('/dashboard');
          }}
        >
          <Text style={styles.deleteText}>Delete Device</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FULLSCREEN VIDEO */}
      {fullscreen && (
        <Modal visible animationType="fade" onRequestClose={closeFullscreen}>
          <View style={styles.fullscreenContainer}>
            <LiveStreamMobile
              streamUrl={`http://192.168.0.109:5002/stream_from_react?url=${encodeURIComponent(
                device.url
              )}`}
              style={{ flex: 1 }}
            />

            <TouchableOpacity style={styles.closeBtn} onPress={closeFullscreen}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */
const Row = ({ children }) => (
  <View style={styles.row}>{children}</View>
);

const StatCard = ({ label, value, highlight }) => (
  <View style={[styles.statCard, highlight && styles.highlightCard]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50
  },
  headerLeft: { flexDirection: 'row', gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  container: { padding: 15 },

  previewWrapper: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#000'
  },

  fullscreenBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 20
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },

  statCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6
  },

  statLabel: {
    fontSize: 15,
    color: '#125049',
    marginBottom: 6,
    fontWeight: '600'
  },

  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F312D'
  },

  highlightCard: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fca5a5'
  },

  deleteBtn: {
    backgroundColor: '#dc3545',
    padding: 14,
    borderRadius: 12,
    marginVertical: 25
  },

  deleteText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },

  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000'
  },

  closeBtn: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20
  }
});
