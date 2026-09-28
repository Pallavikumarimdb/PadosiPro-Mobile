import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton, PrimaryButton, Screen } from '../../components/ui';

const OPTIONS = [
  { key: 'Standard', sub: 'Within a few days is fine', icon: 'calendar-outline' },
  { key: 'Same day', sub: 'Today if possible', icon: 'sunny-outline' },
  { key: 'Express', sub: 'As soon as you can', icon: 'flash-outline' },
  { key: 'Scheduled', sub: 'I have a specific time', icon: 'time-outline' },
] as const;

/** Screenshot 9 — "When do you need this?" Shared urgency for all picked tasks. */
export default function Urgency() {
  const { picks } = useLocalSearchParams<{ picks?: string }>();
  const [picked, setPicked] = useState<string>('Standard');

  function onNext() {
    router.push({
      pathname: '/main/request-details',
      params: { picks: picks ?? '[]', urgency: picked },
    });
  }

  return (
    <Screen>
      <View className="pt-4">
        <BackButton />
        <Text className="mt-2 text-[24px] font-bold text-ink">When do you need this?</Text>
        <Text className="mt-1 text-[13px] text-muted">Pick what feels closest. You can always add detail next.</Text>
      </View>
      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        {OPTIONS.map((o) => {
          const active = picked === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => setPicked(o.key)}
              className={`mb-3 flex-row items-center rounded-xl border bg-card p-4 ${
                active ? 'border-primary bg-mint' : 'border-line'
              }`}
              style={active ? { borderLeftWidth: 3, borderLeftColor: '#C2912A' } : undefined}
            >
              <Ionicons name={o.icon} size={20} color={active ? '#0C5B40' : '#64748B'} />
              <View className="ml-3">
                <Text className="text-[15px] font-bold text-ink">{o.key}</Text>
                <Text className="mt-0.5 text-[13px] text-muted">{o.sub}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View className="pb-6 pt-2">
        <PrimaryButton title="Next" onPress={onNext} />
      </View>
    </Screen>
  );
}
