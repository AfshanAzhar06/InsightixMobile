import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import API from "../../src/Services/api";

export default function NotificationsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedType, setSelectedType] = useState("ALL");
  const [alertTypes, setAlertTypes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, selectedType]);

  const fetchAlerts = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    try {
      const res = await API.get("/alerts");
      const data = res.data || [];
      setAlerts(data);

      // Extract unique alert types for Picker
      const types = ["ALL", ...new Set(data.map((a) => a.type))];
      setAlertTypes(types);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
      Alert.alert("Error", "Failed to fetch alerts");
    }
  };

  const filterAlerts = () => {
    if (selectedType === "ALL") setFilteredAlerts(alerts);
    else setFilteredAlerts(alerts.filter((a) => a.type === selectedType));
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Alert",
      "Are you sure you want to delete this alert?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/alerts/${id}`);
              setAlerts((prev) => prev.filter((a) => a._id !== id));
            } catch (err) {
              Alert.alert("Error", "Failed to delete alert");
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/");
        },
      },
    ]);
  };

  const renderAlert = ({ item }) => (
    <View style={styles.alertCard}>
      <Ionicons name="alert-circle" size={26} color="#dc2626" />
      <View style={styles.alertDetails}>
        <Text style={styles.alertType}>{item.type}</Text>
        <Text style={styles.alertMessage}>{item.message}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            <Text style={styles.metaLabel}>Device: </Text>
            {item.deviceId?.name || "Unknown"}
          </Text>
          <Text style={styles.meta}>
            <Text style={styles.metaLabel}>Location: </Text>
            {item.deviceId?.location || "Unknown"}
          </Text>
        </View>
        <Text style={styles.time}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <Ionicons name="trash-outline" size={22} color="#dc2626" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="notifications" size={24} color="#125049" />
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="person-circle-outline" size={34} color="#0F312D" />
        </TouchableOpacity>
      </View>

      {/* FILTER PICKER */}
      <View style={styles.pickerContainer}>
        <Text style={styles.filterLabel}>Filter by Activity:</Text>
        <Picker
          selectedValue={selectedType}
          onValueChange={(itemValue) => setSelectedType(itemValue)}
          style={styles.picker}
        >
          {alertTypes.map((type, idx) => (
            <Picker.Item key={idx} label={type} value={type} />
          ))}
        </Picker>
      </View>

      {/* ALERT LIST */}
      {filteredAlerts.length === 0 ? (
        <Text style={styles.empty}>No alerts found</Text>
      ) : (
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item._id}
          renderItem={renderAlert}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
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
  pickerContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 2,
  },
  filterLabel: { fontSize: 14, fontWeight: "600", color: "#125049" },
  picker: { height: 50, width: "100%" },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#6b7280" },
  alertCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    alignItems: "flex-start",
    gap: 12,
  },
  alertDetails: { flex: 1 },
  alertType: { fontSize: 15, fontWeight: "700", color: "#b91c1c", marginBottom: 2 },
  alertMessage: { fontSize: 14, color: "#111827", marginBottom: 6 },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: 12, color: "#374151" },
  metaLabel: { fontWeight: "600" },
  time: { fontSize: 11, color: "#6b7280", marginTop: 4 },
});
