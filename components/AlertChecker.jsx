import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import API from '../src/Services/api';

const AlertChecker = ({ utilization, deviceId }) => {
  const lastBucket = useRef(-1);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    const u = Number(utilization) || 0;
    const bucket = Math.floor(u / 10);

    if (!deviceId) return;

    if (bucket > lastBucket.current && bucket >= 5) {
      const msg = `⚠️ Utilization reached ${bucket * 10}%`;
      setPopupMessage(msg);

      // Send alert to backend
      API.post('/AlertScreen', {
        message: `Occupancy alert: ${u}% of allowed people are currently present.`,
        type: 'High Utilization',
        utilization: u,
        deviceId
      }).catch(err => console.error('Failed to send alert', err));

      lastBucket.current = bucket;

      setTimeout(() => setPopupMessage(''), 5000);
    }
  }, [utilization, deviceId]);

  if (!popupMessage) return null;

  return (
    <View style={styles.popup}>
      <Text style={styles.popupText}>{popupMessage}</Text>
    </View>
  );
};

export default AlertChecker;

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  popupText: { color: '#856404', fontWeight: 'bold' }
});
