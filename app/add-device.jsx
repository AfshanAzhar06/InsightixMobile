import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../src/Services/api';

const AddDevice = () => {
  const { device } = useLocalSearchParams();
  const editingDevice = device ? JSON.parse(device) : null;

  const [deviceData, setDeviceData] = useState({
    name: '',
    location: '',
    ip: '',
    url: '',
    type: '',
    spaceUtilization: '',
  });

  const [errors, setErrors] = useState({});

  // 🔹 Prefill form when updating
  useEffect(() => {
    if (editingDevice) {
      setDeviceData({
        name: editingDevice.name || '',
        location: editingDevice.location || '',
        ip: editingDevice.ip || '',
        url: editingDevice.url || '',
        type: editingDevice.type || '',
        spaceUtilization: editingDevice.spaceUtilization || '',
      });
    }
  }, []);

  // 🔹 Validation
  const validateForm = () => {
    let errs = {};
    if (!deviceData.name) errs.name = 'Device name required';
    if (!deviceData.location) errs.location = 'Location required';
    if (!deviceData.ip) errs.ip = 'IP required';
    if (!deviceData.url) errs.url = 'URL required';
    if (!deviceData.type) errs.type = 'Type required';
    if (!deviceData.spaceUtilization)
      errs.spaceUtilization = 'Space utilization required';
    return errs;
  };

  // 🔹 Submit handler
  const handleSubmit = async () => {
    const errs = validateForm();
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Unauthorized', 'Please login first');
        router.replace('/');
        return;
      }

      if (editingDevice) {
        await API.put(`/devices/${editingDevice._id}`, deviceData);
        Alert.alert('Success', 'Device updated successfully');
        router.replace('/(tabs)/settings');
      } else {
        await API.post('/devices/add', deviceData);
        Alert.alert('Success', 'Device added successfully');
        router.replace('/dashboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Operation failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {editingDevice ? 'Update Device' : 'Add Device'}
      </Text>

      {Object.keys(deviceData).map((key) => (
        <TextInput
          key={key}
          placeholder={key.replace(/([A-Z])/g, ' $1')}
          style={[
            styles.input,
            errors[key] && { borderColor: 'red' },
          ]}
          value={deviceData[key]}
          onChangeText={(text) =>
            setDeviceData({ ...deviceData, [key]: text })
          }
        />
      ))}

      <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
        <Text style={styles.btnText}>
          {editingDevice ? 'Update Device' : 'Add Device'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddDevice;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#125049',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#125049',
    borderRadius: 30,
    padding: 14,
    marginBottom: 12,
    fontWeight: '600',
  },
  btn: {
    backgroundColor: '#125049',
    padding: 16,
    borderRadius: 30,
    marginTop: 15,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
