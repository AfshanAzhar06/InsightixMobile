// /services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 172.31.211.130:5000
const API = axios.create({
  baseURL: 'http://192.168.0.109:5000/api', // <-- your PC IP
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
