import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton, ErrorBanner, PrimaryButton, Screen, SectionCard } from '../../components/ui';
import { taskService } from '../../services/padosi';

interface Pick {
  category: string;
  helpKind: string;
  service: string;
}

/** Confirm step: review picks (urgency + details were set on the previous screens), submit all. */
export default function Confirm() {
  const { picks: rawPicks, urgency, details } = useLocalSearchParams<{
    picks?: string;
    urgency?: string;
    details?: string;
  }>();
  const initial: Pick[] = useMemo(() => {
    try {
      const parsed = JSON.parse(rawPicks ?? '[]') as Pick[];
      return Array.isArray(parsed) ? parsed.filter((p) => p?.category && p?.service) : [];
    } catch {
      return [];
    }
  }, [rawPicks]);

  const [picks, setPicks] = useState<Pick[]>(initial);
  const sharedUrgency = urgency ?? 'Standard';
  const sharedDetails = (details ?? '').trim();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function onConfirm() {
    if (picks.length === 0) return;
    setSaving(true);
    setServerError(null);
    try {
      for (const p of picks) {
        await taskService.createRequest({
          category: p.category,
          helpKind: p.helpKind || undefined,
          service: p.service || undefined,
          urgency: sharedUrgency,
          details: sharedDetails || undefined,
        });
      }
      setDone(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Could not save. Please try again.');
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
      <View className="pt-4">
        <BackButton />
        <Text className="mt-2 text-[24px] font-bold text-ink">Review your picks</Text>
        <Text className="mt-1 text-[13px] text-muted">
          {picks.length} task{picks.length === 1 ? '' : 's'} · {sharedUrgency}
          {sharedDetails ? ` · “${sharedDetails}”` : ''}
        </Text>
      </View>
      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
          {picks.map((p) => (
            <SectionCard key={`${p.category}|${p.service}`}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-ink">{p.service}</Text>
                  <Text className="mt-0.5 text-[13px] text-muted">
                    {[p.category, p.helpKind].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setPicks((prev) => prev.filter((x) => !(x.category === p.category && x.service === p.service)))}
                  hitSlop={12}
                  className="ml-3 p-1"
                >
                  <Ionicons name="close-circle-outline" size={20} color="#94A3B8" />
                </Pressable>
              </View>
            </SectionCard>
          ))}

          <Text className="mb-2 mt-2 text-[12px] font-bold uppercase tracking-widest text-muted">
            When & what
          </Text>
          <SectionCard>
            <Text className="text-[15px] font-bold text-ink">{sharedUrgency}</Text>
            <Text className="mt-1 text-[13px] leading-5 text-muted">
              {sharedDetails || 'No extra details added.'}
            </Text>
          </SectionCard>
          <ErrorBanner message={serverError} />
          <View className="h-2" />
        </ScrollView>
        <View className="pb-6 pt-2">
          <PrimaryButton
            title={`Confirm ${picks.length} task${picks.length === 1 ? '' : 's'}`}
            loading={saving}
            loadingTitle="Saving..."
            disabled={picks.length === 0}
            onPress={onConfirm}
          />
        </View>
    </Screen>
  );
}
