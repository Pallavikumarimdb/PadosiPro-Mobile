import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton, ErrorBanner, PrimaryButton, Screen } from '../../components/ui';
import { taskService } from '../../services/padosi';

/** Screenshot 10 — "Tell us a little more" -> persists a service request. */
export default function RequestDetails() {
  const { category, helpKind, service, urgency } = useLocalSearchParams<{
    category?: string;
    helpKind?: string;
    service?: string;
    urgency?: string;
  }>();
  const [details, setDetails] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit() {
    setSaving(true);
    setServerError(null);
    try {
      await taskService.createRequest({
        category: category ?? '',
        helpKind: helpKind || undefined,
        service: service || undefined,
        urgency: urgency || undefined,
        details: details.trim() || undefined,
      });
      setDone(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Could not submit. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-2">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-mint">
            <Ionicons name="checkmark" size={30} color="#0C5B40" />
          </View>
          <Text className="mt-4 text-center text-[22px] font-bold text-ink">Leave it with us</Text>
          <Text className="mt-2 text-center text-[14px] leading-6 text-muted">
            Your Lifestyle Manager will take it from here and keep you posted.
          </Text>
        </View>
        <View className="pb-6">
          <PrimaryButton title="Back to home" onPress={() => router.replace('/main/home')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="pt-4">
          <BackButton />
          <View className="mt-3 self-start rounded-full border border-gold/40 bg-goldSoft px-3 py-1.5">
            <Text className="text-[11px] font-semibold text-gold">
              {[category, service || helpKind].filter(Boolean).join(' · ')}
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
          <ErrorBanner message={serverError} />
          <View className="mt-2" />
        </ScrollView>
        <View className="pb-6 pt-2">
          <PrimaryButton title="Leave it with us" loading={saving} loadingTitle="Sending..." onPress={onSubmit} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
