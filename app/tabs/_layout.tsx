import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform } from "react-native";
import Toast from "react-native-toast-message"; // ✅ Toast import

export default function TabsLayout() {
  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#125049",
          tabBarInactiveTintColor: "#0F312D",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 0,
            elevation: 4,
            height: Platform.OS === "ios" ? 70 : 60,
            paddingBottom: Platform.OS === "ios" ? 15 : 8,
          },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";

            switch (route.name) {
              case "dashboard":
                iconName = focused ? "home" : "home-outline";
                break;
              case "notifications":
                iconName = focused ? "notifications" : "notifications-outline";
                break;
              case "analytics":
                iconName = focused ? "stats-chart" : "stats-chart-outline";
                break;
              case "settings":
                iconName = focused ? "settings" : "settings-outline";
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="dashboard" options={{ title: "Home" }} />
        <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
        <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>

      {/* ✅ Toast Provider */}
      <Toast />
    </>
  );
}
