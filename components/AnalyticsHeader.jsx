import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from '@expo/vector-icons';

const AnalyticsHeader = () => {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace("/");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <MaterialCommunityIcons name="chart-bar" size={24} color="#125049" />
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="person-circle-outline" size={30} color="#0F312D" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#125049" },
});

export default AnalyticsHeader;
