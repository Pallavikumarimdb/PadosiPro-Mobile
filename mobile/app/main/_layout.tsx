import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAF9F6' } }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="urgency" />
      <Stack.Screen name="request-details" />
      <Stack.Screen name="account" />
      <Stack.Screen name="household" />
    </Stack>
  );
}
