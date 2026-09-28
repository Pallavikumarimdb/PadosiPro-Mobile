import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton, PrimaryButton, Screen } from '../../components/ui';

/** Screenshot 10 — "Tell us a little more." Shared details for all picked tasks. */
export default function RequestDetails() {
  const { picks: rawPicks, urgency } = useLocalSearchParams<{ picks?: string; urgency?: string }>();
  const count = useMemo(() => {
    try {
      const parsed = JSON.parse(rawPicks ?? '[]') as unknown[];
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }, [rawPicks]);
  const [details, setDetails] = useState('');

  function onNext() {
    router.push({
      pathname: '/main/confirm',
      params: { picks: rawPicks ?? '[]', urgency: urgency ?? 'Standard', details },
    });
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="pt-4">
          <BackButton />
          <View className="mt-3 self-start rounded-full border border-gold/40 bg-goldSoft px-3 py-1.5">
            <Text className="text-[11px] font-semibold text-gold">
              {count} task{count === 1 ? '' : 's'} · {urgency ?? 'Standard'}
            </Text>
          </View>
          <Text className="mt-3 text-[24px] font-bold text-ink">Tell us a little more</Text>
          <Text className="mt-1 text-[13px] text-muted">One or two lines is enough. We&apos;ll take it from there.</Text>
        </View>
        <ScrollView className="mt-4 flex-1" keyboardShouldPersistTaps="handled">
          <View className="rounded-xl border border-line bg-card p-4" style={{ minHeight: 140 }}>
            <TextInput
              value={details}
              onChangeText={setDetails}
              multiline
              textAlignVertical="top"
              placeholder=""
              className="flex-1 text-[15px] text-ink"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View className="mt-2" />
        </ScrollView>
        <View className="pb-6 pt-2">
          <PrimaryButton title="Review picks" onPress={onNext} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
