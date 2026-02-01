import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  empty: { textAlign: "center", marginTop: 20, color: "#777" },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  alertText: { marginLeft: 10, fontSize: 15, color: "#333" },
});
