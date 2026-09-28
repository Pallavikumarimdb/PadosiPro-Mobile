import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Chip, ErrorBanner, MicroLabel, Screen } from '../../components/ui';
import { taskService, type Category, type ServiceRequest } from '../../services/padosi';
import { searchCatalog, type Suggestion } from '../../services/searchIndex';
import { useAuth } from '../../store/AuthContext';
import { iconFor } from '../../utils/icons';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Screenshot 5 — Home: greeting, search, popular chips, how it works, LM card. */
export default function Home() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => searchCatalog(query, tasks), [query, tasks]);
  const dropdown = submitted ? [] : results.slice(0, 6);
  const best = submitted && query.trim() ? results[0] : undefined;
  // Other possibilities prefer a different category than the best match,
  // so "travel insurance" surfaces the Insurance rows instead of more Travel rows.
  const others = useMemo(() => {
    if (!submitted || !query.trim() || results.length < 2) return [];
    const [first, ...rest] = results;
    const diff = rest.filter((r) => r.category !== first.category);
    const same = rest.filter((r) => r.category === first.category);
    return [...diff, ...same].slice(0, 2);
  }, [submitted, query, results]);

  function onChangeQuery(v: string) {
    setQuery(v);
    setSubmitted(false);
  }

  function submitSearch() {
    if (query.trim()) setSubmitted(true);
  }

  function clearSearch() {
    setQuery('');
    setSubmitted(false);
  }

  function goToDetails(s: Suggestion) {
    const serviceName = s.service || s.phrase || s.helpKind || s.category;
    router.push({
      pathname: '/main/urgency',
      params: {
        picks: JSON.stringify([{
          category: s.category,
          helpKind: s.helpKind ?? '',
          service: serviceName,
        }]),
      },
    });
  }

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

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

  async function loadRequests() {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const res = await taskService.listRequests();
      setRequests(res.requests ?? []);
    } catch (e) {
      setRequestsError(e instanceof Error ? e.message : 'Could not load your requests.');
    } finally {
      setRequestsLoading(false);
    }
  }

  useEffect(() => {
    // Run both in parallel — they are independent
    load();
    loadRequests();
  }, []);

  const firstName = (profile?.fullName || '').split(' ')[0] || 'there';
  const popular = tasks.filter((t) => !t.comingSoon).slice(0, 5);

  return (
    <Screen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between pt-4">
          <Text className="text-[22px] font-bold text-ink">
            {greeting()}, {firstName}
          </Text>
          <Pressable onPress={() => router.push('/main/account')} hitSlop={12}>
            <Ionicons name="person-outline" size={22} color="#101E2C" />
          </Pressable>
        </View>

        <Text className="mt-6 text-[20px] font-bold text-ink">What do you need help with?</Text>
        <View
          className="mt-3 flex-row items-center rounded-xl border border-line bg-card px-4"
          style={{ height: 52 }}
        >
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            onSubmitEditing={submitSearch}
            placeholder="AC leaking, cook for weekends..."
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            className="ml-2 flex-1 text-[14px] text-ink"
          />
          {query ? (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>

        {dropdown.length > 0 ? (
          <View className="mt-2 rounded-xl border border-line bg-card px-4 py-1">
            {dropdown.map((s, i) => (
              <Pressable
                key={s.phrase}
                onPress={() => {
                  setQuery(s.phrase);
                  setSubmitted(true);
                }}
                className={`flex-row items-center py-3 ${i < dropdown.length - 1 ? 'border-b border-line' : ''}`}
              >
                <Ionicons name="search-outline" size={16} color="#64748B" />
                <Text className="ml-2.5 flex-1 text-[14px] text-ink">{s.phrase}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {submitted && query.trim() ? (
          <View className="mt-2 rounded-xl border border-line bg-card p-4">
            {best ? (
              <>
                <MicroLabel>Best match</MicroLabel>
                <View className="rounded-xl bg-mint p-4">
                  <Text className="text-center text-[15px] font-bold text-ink">{best.phrase}</Text>
                  <Pressable
                    onPress={() => goToDetails(best)}
                    className="mt-3 h-12 flex-row items-center justify-center rounded-xl bg-primary"
                  >
                    <Text className="text-[15px] font-bold text-white">Continue</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
                  </Pressable>
                </View>
                {best.diyLabel && best.diyUrl ? (
                  <Pressable onPress={() => Linking.openURL(best.diyUrl as string)} className="mt-3 flex-row items-center" hitSlop={8}>
                    <Ionicons name="open-outline" size={15} color="#0C5B40" />
                    <Text className="ml-1.5 flex-1 text-[13px] font-semibold text-primary">{best.diyLabel}</Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
            {others.length > 0 ? (
              <View className="mt-3">
                <MicroLabel>Other possibilities</MicroLabel>
                {others.map((o) => (
                  <Pressable
                    key={o.phrase}
                    onPress={() => goToDetails(o)}
                    className="flex-row items-center justify-between border-t border-line py-3"
                  >
                    <Text className="flex-1 text-[14px] text-ink">{o.phrase}</Text>
                    <Ionicons name="chevron-forward" size={17} color="#94A3B8" />
                  </Pressable>
                ))}
              </View>
            ) : null}
            <Pressable
              onPress={() => router.push('/main/categories')}
              className="flex-row items-center justify-between border-t border-line py-3"
            >
              <Text className="flex-1 text-[13px] font-semibold text-primary">
                Not what you meant? Tell us in your own words
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#0C5B40" />
            </Pressable>
          </View>
        ) : null}

        <Text className="mb-2 mt-6 text-[12px] font-bold uppercase tracking-widest text-muted">
          Popular with families like yours
        </Text>
        {loading ? (
          <ActivityIndicator color="#0C5B40" className="my-4" />
        ) : (
          <View className="flex-row flex-wrap">
            {popular.map((t) => (
              <Chip
                key={t.title}
                label={t.title}
                icon={iconFor(t.icon)}
                onPress={() => router.push({ pathname: '/main/categories', params: { focus: t.title } })}
              />
            ))}
          </View>
        )}
        <ErrorBanner message={error} />
        {error ? (
          <Pressable onPress={load} className="mb-2 self-start" hitSlop={8}>
            <Text className="text-sm font-semibold text-primary">Retry</Text>
          </Pressable>
        ) : null}

        <Pressable onPress={() => router.push('/main/categories')} className="mt-1 flex-row items-center" hitSlop={8}>
          <Text className="text-[14px] font-bold text-primary">Browse everything we do</Text>
          <Ionicons name="arrow-forward" size={16} color="#0C5B40" style={{ marginLeft: 6 }} />
        </Pressable>

        <Text className="mb-3 mt-6 text-[12px] font-bold uppercase tracking-widest text-muted">
          Your requests
        </Text>
        {requestsLoading ? (
          <ActivityIndicator color="#0C5B40" className="my-2" />
        ) : requestsError ? (
          <View>
            <Text className="text-[13px] text-danger">{requestsError}</Text>
            <Pressable onPress={loadRequests} className="mt-1 self-start" hitSlop={8}>
              <Text className="text-sm font-semibold text-primary">Retry</Text>
            </Pressable>
          </View>
        ) : requests.length === 0 ? (
          <View className="rounded-xl border border-line bg-card p-4">
            <Text className="text-[14px] font-bold text-ink">No requests yet</Text>
            <Text className="mt-1 text-[13px] text-muted">
              Pick a service above and your Lifestyle Manager will take it from there.
            </Text>
          </View>
        ) : (
          requests.slice(0, 5).map((r) => (
            <View key={r.id} className="mb-3 rounded-xl border border-line bg-card p-4">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-[15px] font-bold text-ink">{r.service || r.category}</Text>
                <View className="rounded-full bg-goldSoft px-2.5 py-1">
                  <Text className="text-[11px] font-bold text-gold">{r.status}</Text>
                </View>
              </View>
              <Text className="mt-0.5 text-[13px] text-muted">
                {[r.category, r.helpKind, r.urgency].filter(Boolean).join(' · ')}
              </Text>
            </View>
          ))
        )}

        <Text className="mb-3 mt-6 text-[12px] font-bold uppercase tracking-widest text-muted">
          How PadosiPro works
        </Text>
        {[
          { icon: 'chatbox-ellipses-outline', title: 'Tell us what you need', sub: 'In your own words. No forms to hunt through.' },
          { icon: 'person-outline', title: 'Your Lifestyle Manager takes it on', sub: 'One person who knows your family and follows it through.' },
          { icon: 'checkmark-circle-outline', title: 'You see it done', sub: 'Updates as things actually happen, with proof when it matters.' },
        ].map((s) => (
          <View key={s.title} className="mb-4 flex-row">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-mint">
              <Ionicons name={s.icon as never} size={17} color="#0C5B40" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-bold text-ink">{s.title}</Text>
              <Text className="mt-0.5 text-[13px] leading-5 text-muted">{s.sub}</Text>
            </View>
          </View>
        ))}

        <View className="mb-6 mt-2 rounded-xl border border-line bg-card p-4">
          <Text className="text-[13px] text-muted">Your Lifestyle Manager</Text>
          <View className="mt-0.5 flex-row items-center justify-between">
            <Text className="text-[16px] font-bold text-ink">Pilot LM</Text>
            <View className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={15} color="#0C5B40" />
              <Text className="ml-1.5 text-[14px] font-bold text-primary">Chat</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </Screen>
  );
}
