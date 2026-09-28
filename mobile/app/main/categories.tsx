import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton, Chip, ErrorBanner, MicroLabel, PrimaryButton, Screen } from '../../components/ui';
import { taskService, type Category } from '../../services/padosi';
import { iconFor } from '../../utils/icons';

export default function Categories() {
  const { focus, q } = useLocalSearchParams<{ focus?: string; q?: string }>();
  const [tasks, setTasks] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [kinds, setKinds] = useState<Record<string, string>>({});
  const [picks, setPicks] = useState<{ category: string; helpKind: string; service: string }[]>([]);
  const [query, setQuery] = useState(q ?? '');
  const [promptKindFor, setPromptKindFor] = useState<string | null>(null);

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

  useEffect(() => {
    if (q) setQuery(q);
  }, [q]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tasks;
    return tasks.filter((t) => {
      const hay = [
        t.title,
        t.description,
        ...(t.kinds ?? []),
        ...Object.values(t.servicesByKind ?? {}).flat(),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [tasks, query]);

  // When searching, auto-expand the first match so options are visible.
  useEffect(() => {
    if (query.trim() && filtered.length > 0 && !filtered.some((t) => t.title === open)) {
      setOpen(filtered[0].title);
    }
  }, [query, filtered, open]);

  function onReview() {
    if (picks.length === 0) return;
    router.push({ pathname: '/main/urgency', params: { picks: JSON.stringify(picks) } });
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
        <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <ErrorBanner message={error} />
          <View
            className="mb-3 flex-row items-center rounded-xl border border-line bg-card px-4"
            style={{ height: 52 }}
          >
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search services..."
              placeholderTextColor="#94A3B8"
              returnKeyType="search"
              className="ml-2 flex-1 text-[14px] text-ink"
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            ) : null}
          </View>
          {filtered.length === 0 ? (
            <View className="items-center rounded-xl border border-line bg-card p-6">
              <Text className="text-[15px] font-bold text-ink">No matches for “{query.trim()}”</Text>
              <Text className="mt-1 text-center text-[13px] text-muted">
                Try a different word, or browse everything below.
              </Text>
              <Pressable onPress={() => setQuery('')} className="mt-3" hitSlop={8}>
                <Text className="text-sm font-semibold text-primary">Clear search</Text>
              </Pressable>
            </View>
          ) : null}
          {filtered.map((t) => {
            const expanded = open === t.title;
            // Defensive: older API responses may omit these arrays — never crash, just hide the groups.
            const kindList = t.kinds ?? [];
            // Services depend on the selected help-kind (each kind has its own list).
            const selectedKind = kinds[t.title];
            const serviceList = ((t.servicesByKind ?? {})[selectedKind] ?? []);
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
                    {kindList.length > 0 ? (
                      <>
                        <MicroLabel style={promptKindFor === t.title ? { color: '#E53935' } : undefined}>
                          {promptKindFor === t.title ? '⬆ Pick a kind first' : 'What kind of help?'}
                        </MicroLabel>
                        <View className="flex-row flex-wrap">
                          {kindList.map((k) => (
                            <Chip
                              key={k}
                              label={k}
                              selected={kinds[t.title] === k}
                              onPress={() => {
                                setKinds((p) => ({ ...p, [t.title]: k }));
                              }}
                            />
                          ))}
                        </View>
                      </>
                    ) : null}
                    {serviceList.length > 0 ? (
                      <>
                        <MicroLabel>Choose a service</MicroLabel>
                        <View className="flex-row flex-wrap">
                          {serviceList.map((s) => {
                            const picked = picks.some((p) => p.category === t.title && p.service === s);
                            return (
                              <Chip
                                key={s}
                                label={s}
                                selected={picked}
                                onPress={() => {
                                  const kind = kinds[t.title];
                                  if (!kind) {
                                    // Flash the "Pick a kind" prompt
                                    setPromptKindFor(t.title);
                                    setTimeout(() => setPromptKindFor(null), 1500);
                                    return;
                                  }
                                  setPicks((prev) =>
                                    picked
                                      ? prev.filter((p) => !(p.category === t.title && p.service === s))
                                      : [...prev, { category: t.title, helpKind: kind, service: s }],
                                  );
                                }}
                              />
                            );
                          })}
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
        <PrimaryButton
          title={picks.length > 0 ? `Review ${picks.length} pick${picks.length > 1 ? 's' : ''}` : 'Pick services to continue'}
          disabled={picks.length === 0}
          onPress={onReview}
        />
      </View>
    </Screen>
  );
}
