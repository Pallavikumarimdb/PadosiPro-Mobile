import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton, Chip, ErrorBanner, MicroLabel, PrimaryButton, Screen } from '../../components/ui';
import { taskService, type Category } from '../../services/padosi';
import { iconFor } from '../../utils/icons';

/** Screenshots 6-8 — Task selection: expandable categories, help-kind + service chips. */
export default function Categories() {
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const [tasks, setTasks] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [kinds, setKinds] = useState<Record<string, string>>({});
  const [services, setServices] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await taskService.list();
      setTasks(res.tasks);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load services.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (focus) setOpen(focus);
  }, [focus]);

  const selection = useMemo(() => {
    if (!open) return null;
    const cat = tasks.find((t) => t.title === open);
    if (!cat) return null;
    return { category: cat.title, helpKind: kinds[cat.title], service: services[cat.title] };
  }, [open, tasks, kinds, services]);

  function onContinue() {
    if (!selection) return;
    router.push({
      pathname: '/main/urgency',
      params: {
        category: selection.category,
        helpKind: selection.helpKind ?? '',
        service: selection.service ?? '',
      },
    });
  }

  return (
    <Screen>
      <View className="pt-4">
        <BackButton />
        <Text className="mt-2 text-[24px] font-bold text-ink">What do you need help with?</Text>
        <Text className="mt-1 text-[13px] text-muted">Pick a category, then choose a service. You can add details next.</Text>
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0C5B40" />
        </View>
      ) : (
        <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
          <ErrorBanner message={error} />
          {tasks.map((t) => {
            const expanded = open === t.title;
            return (
              <Pressable
                key={t.title}
                disabled={t.comingSoon}
                onPress={() => setOpen(expanded ? null : t.title)}
                className={`mb-3 rounded-xl border bg-card p-4 ${expanded ? 'border-primary bg-mint' : 'border-line'}`}
                style={expanded ? { borderLeftWidth: 3, borderLeftColor: '#C2912A' } : undefined}
              >
                <View className="flex-row items-center">
                  <View className={`h-10 w-10 items-center justify-center rounded-xl ${expanded ? 'bg-primary' : 'bg-mint'}`}>
                    <Ionicons name={iconFor(t.icon)} size={19} color={expanded ? '#fff' : '#0C5B40'} />
                  </View>
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[15px] font-bold text-ink">{t.title}</Text>
                      {t.comingSoon ? (
                        <View className="rounded-full border border-gold/60 bg-goldSoft px-2 py-0.5">
                          <Text className="text-[10px] font-bold text-gold">Soon</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="mt-0.5 text-[13px] text-muted">{t.description}</Text>
                  </View>
                </View>
                {expanded && !t.comingSoon ? (
                  <View className="mt-3">
                    {t.kinds.length > 0 ? (
                      <>
                        <MicroLabel>What kind of help?</MicroLabel>
                        <View className="flex-row flex-wrap">
                          {t.kinds.map((k) => (
                            <Chip
                              key={k}
                              label={k}
                              selected={kinds[t.title] === k}
                              onPress={() => setKinds((p) => ({ ...p, [t.title]: k }))}
                            />
                          ))}
                        </View>
                      </>
                    ) : null}
                    {t.services.length > 0 ? (
                      <>
                        <MicroLabel>Choose a service</MicroLabel>
                        <View className="flex-row flex-wrap">
                          {t.services.map((s) => (
                            <Chip
                              key={s}
                              label={s}
                              selected={services[t.title] === s}
                              onPress={() => setServices((p) => ({ ...p, [t.title]: s }))}
                            />
                          ))}
                        </View>
                      </>
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
          <View className="h-2" />
        </ScrollView>
      )}
      <View className="pb-6 pt-2">
        <PrimaryButton title="Continue" disabled={!selection} onPress={onContinue} />
      </View>
    </Screen>
  );
}
