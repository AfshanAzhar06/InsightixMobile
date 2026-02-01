import { StyleSheet } from "react-native";

export default StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15 },
  notification: { position: "relative" },
  badge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  badgeText: { color: "#fff", fontSize: 12 },
  profile: { flexDirection: "row", alignItems: "center" },
  profilePic: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  profileName: { fontSize: 16, fontWeight: "bold" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modal: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  saveBtn: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, marginBottom: 10 },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  deleteBtn: { backgroundColor: "#dc3545", padding: 12, borderRadius: 8, marginBottom: 10 },
  deleteText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  logoutBtn: { backgroundColor: "#555", padding: 12, borderRadius: 8, marginBottom: 10 },
  logoutText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  cancelBtn: { backgroundColor: "#ccc", padding: 12, borderRadius: 8 },
})