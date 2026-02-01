import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
  const router = useRouter();

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
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image
          source={require('../assets/logo2.jpg')}
          style={styles.logo}
        />
        <Text style={styles.title}>INSIGHTIX</Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons
            name="notifications"
            size={24}
            color="#0F312D"
          />
        </TouchableOpacity>

        

        {/* ➕ ADD DEVICE ICON */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push('/add-device')}
        >
          <Ionicons
            name="add-circle"
            size={30}
            color="#0F312D"
          />
        </TouchableOpacity>
        
      </View>
    </View>
  );
};

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#125049',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: 15,
  },
});

export default Header;
