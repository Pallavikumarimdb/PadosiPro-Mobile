import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BackButton, DangerOutlineButton, Screen, SectionCard } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';

export default function Account() {
  const { user, profile, signOut } = useAuth();

  async function onSignOut() {
    await signOut();
    router.replace('/auth/welcome');
  }

  const mobile = user?.mobile ? `+91 ${user.mobile}` : '—';

  return (
    <Screen>
      <View className="pt-4">
        <BackButton />
        <Text className="mt-2 text-[24px] font-bold text-ink">Account</Text>
      </View>
      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <SectionCard>
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted">Signed in as</Text>
          <Text className="mt-2 text-[15px] font-semibold text-ink">{mobile}</Text>
          {user?.email ? <Text className="mt-0.5 text-[13px] text-muted">{user.email}</Text> : null}
        </SectionCard>

        <SectionCard>
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted">Your LM</Text>
          <Text className="mt-2 text-[16px] font-bold text-ink">Pilot LM</Text>
          <Text className="mt-1 text-[13px] text-muted">{profile?.city ?? 'Mumbai'}</Text>
          {profile?.fullName ? <Text className="mt-1 text-[13px] text-muted">{profile.fullName}</Text> : null}
          {profile ? (
            <View className="mt-3">
              <Text className="text-[13px] leading-5 text-muted">{profile.address}</Text>
              {profile.society ? <Text className="text-[13px] text-muted">Society: {profile.society}</Text> : null}
              {profile.flatUnit ? <Text className="text-[13px] text-muted">Flat / unit: {profile.flatUnit}</Text> : null}
              {profile.gateNotes ? <Text className="text-[13px] text-muted">Gate / notes: {profile.gateNotes}</Text> : null}
              {profile.businessName ? <Text className="text-[13px] text-muted">Business: {profile.businessName}</Text> : null}
            </View>
          ) : null}
        </SectionCard>

        <Pressable onPress={() => router.push('/main/household')}>
          <SectionCard>
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-mint">
                <Ionicons name="people-outline" size={19} color="#0C5B40" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-bold text-ink">Household</Text>
                <Text className="mt-0.5 text-[13px] text-muted">Family members your LM should know about</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </SectionCard>
        </Pressable>

        <SectionCard>
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted">Wallet</Text>
          <Text className="mt-2 text-[15px] font-bold text-ink">Coming soon</Text>
          <Text className="mt-1 text-[13px] leading-5 text-muted">
            Wallet top-up isn&apos;t turned on yet. Your Lifestyle Manager can still handle requests and send you the
            bill directly in the meantime.
          </Text>
        </SectionCard>

        <View className="mb-6 mt-1">
          <DangerOutlineButton title="Sign out" onPress={onSignOut} />
        </View>
      </ScrollView>
    </Screen>
  );
}
