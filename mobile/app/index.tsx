import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../store/AuthContext';

/** Startup gate: token -> /me -> onboarding or main; no token -> auth stack. */
export default function Index() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'signedOut') router.replace('/auth/welcome');
    else if (status === 'needsOnboarding') router.replace('/onboarding/details');
    else router.replace('/main/home');
  }, [status]);

  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator size="large" color="#0C5B40" />
    </View>
  );
}
