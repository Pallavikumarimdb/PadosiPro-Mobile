import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas px-5">
      <Text className="text-xl font-bold text-ink">This screen doesn&apos;t exist.</Text>
      <Link href="/" className="mt-4 text-sm font-semibold text-primary">
        Go to home screen!
      </Link>
    </View>
  );
}
