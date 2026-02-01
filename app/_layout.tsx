// app/_layout.tsx (Root Layout)
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="AlertScreen" />
      <Stack.Screen name="LiveVedioScreen" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
// expo build:android -t apk
