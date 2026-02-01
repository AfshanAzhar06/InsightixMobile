import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import API from "../src/Services/api";
import styles from "../styles/profileHeaderStyles";

export default function ProfileHeader({ onLogout }) {
  const [name, setName] = useState("User");
  const [email, setEmail] = useState("email@example.com");
  const [showModal, setShowModal] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      const storedName = await AsyncStorage.getItem("organizationName");
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);

      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");
      if (!token || role === "admin") return;

      try {
        const res = await API.get("/alerts");
        setUnreadAlerts(res.data.length);
      } catch (err) {
        console.error("Failed to fetch alerts count:", err);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.put(
        "/update-profile",
        { organizationName: name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await AsyncStorage.setItem("organizationName", res.data.organizationName);
      await AsyncStorage.setItem("email", res.data.email);

      setShowModal(false);
      Alert.alert("Success", "Profile updated");
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert("Confirm", "Delete account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View style={styles.header}>
      {/* 🔔 Notification Icon */}
      <TouchableOpacity style={styles.notification} onPress={() => router.push("/notifications")}>
        <Ionicons name="notifications" size={24} color="#007bff" />
        {unreadAlerts > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadAlerts}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Profile Section */}
      <TouchableOpacity style={styles.profile} onPress={() => setShowModal(true)}>
        <Image source={require("../assets/profile.jpg")} style={styles.profilePic} />
        <Text style={styles.profileName}>{name}</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Organization Name" />
            <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="Email" />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
