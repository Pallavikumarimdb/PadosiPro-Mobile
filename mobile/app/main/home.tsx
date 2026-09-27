import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Chip, ErrorBanner, Screen } from '../../components/ui';
import { taskService, type Category } from '../../services/padosi';
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
        <Pressable
          onPress={() => router.push('/main/categories')}
          className="mt-3 flex-row items-center rounded-xl border border-line bg-card px-4"
          style={{ height: 52 }}
        >
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <Text className="ml-2 text-[14px] text-faint">AC leaking, cook for weekends...</Text>
        </Pressable>

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
