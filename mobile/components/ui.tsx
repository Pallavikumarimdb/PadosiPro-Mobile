import { useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

/* ---------- BottomBar: bottom CTA area that clears Android's system nav bar ---------- */
export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="bg-canvas px-5 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      {children}
    </View>
  );
}

/* ---------- Screen: safe-area + consistent horizontal padding ---------- */
export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  void scroll;
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <View className="flex-1 px-5">{children}</View>
    </SafeAreaView>
  );
}

/* ---------- Logo ---------- */
export function Logo({ size = 52 }: { size?: number }) {
  return (
    <View>
      <View
        className="items-center justify-center rounded-2xl bg-primaryDark"
        style={{ width: size, height: size, borderRadius: 14 }}
      >
        <Ionicons name="home" size={size * 0.52} color="#7FD6A8" />
      </View>
      <Text className="mt-2 text-xs font-semibold tracking-widest text-muted">PadosiPro</Text>
    </View>
  );
}

/* ---------- Back ---------- */
export function BackButton({ label = 'Back' }: { label?: string }) {
  return (
    <Pressable onPress={() => router.back()} className="flex-row items-center py-2" hitSlop={12}>
      <Ionicons name="chevron-back" size={16} color="#0C5B40" />
      <Text className="text-sm font-semibold text-primary">{label}</Text>
    </Pressable>
  );
}

/* ---------- Text field ---------- */
interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  prefix?: string;
}

export function Field({ label, error, icon, prefix, ...rest }: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-medium text-muted">{label}</Text>
      <View
        className={`flex-row items-center rounded-xl border bg-card px-4 ${error ? 'border-danger' : 'border-line'}`}
        style={{ minHeight: 56 }}
      >
        {icon ? <Ionicons name={icon} size={18} color="#64748B" /> : null}
        {prefix ? <Text className="ml-2 text-[15px] font-semibold text-ink">{prefix}</Text> : null}
        <TextInput
          className="ml-2 flex-1 py-3 text-[15px] text-ink"
          placeholderTextColor="#94A3B8"
          {...rest}
        />
      </View>
      {error ? <Text className="mt-1.5 text-[13px] text-danger">{error}</Text> : null}
    </View>
  );
}

/* ---------- Primary button (bottom CTA) ---------- */
export function PrimaryButton({
  title,
  onPress,
  loading,
  loadingTitle,
  disabled,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      className={`h-14 items-center justify-center rounded-xl ${inactive ? 'bg-sage' : 'bg-primary'}`}
    >
      {loading ? (
        <View className="flex-row items-center">
          <ActivityIndicator color="#fff" />
          <Text className="ml-2 text-[15px] font-bold text-white">{loadingTitle ?? title}</Text>
        </View>
      ) : (
        <Text className="text-[15px] font-bold text-white">{title}</Text>
      )}
    </Pressable>
  );
}

/* ---------- Secondary / outline danger ---------- */
export function DangerOutlineButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 flex-row items-center justify-center rounded-xl border border-danger bg-card"
    >
      <Ionicons name="log-out-outline" size={16} color="#B91C1C" />
      <Text className="ml-1.5 text-[15px] font-semibold text-danger">{title}</Text>
    </Pressable>
  );
}

/* ---------- OTP input (6 boxes, one hidden input) ---------- */
export function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');
  return (
    <Pressable onPress={() => ref.current?.focus()}>
      <View className="flex-row justify-between">
        {digits.map((d, i) => (
          <View
            key={i}
            className={`h-14 w-12 items-center justify-center rounded-xl border bg-card ${
              focused && value.length === i ? 'border-primary' : 'border-line'
            }`}
          >
            <Text className="text-xl font-bold text-ink">{d || <Text className="text-faint">–</Text>}</Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />
    </Pressable>
  );
}

/* ---------- Chips ---------- */
export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-2 mr-2 flex-row items-center rounded-full border px-4 py-2.5 ${
        selected ? 'border-primary bg-primary' : 'border-line bg-card'
      }`}
    >
      {icon ? (
        <Ionicons name={icon} size={15} color={selected ? '#fff' : '#0C5B40'} style={{ marginRight: 6 }} />
      ) : null}
      <Text className={`text-[13px] font-semibold ${selected ? 'text-white' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Cards / rows ---------- */
export function SectionCard({ children }: { children: ReactNode }) {
  return <View className="mb-3 rounded-xl border border-line bg-card p-4">{children}</View>;
}

export function MicroLabel({ children }: { children: ReactNode }) {
  return <Text className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{children}</Text>;
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View className="mb-3 rounded-xl border border-danger/30 bg-danger/5 p-3">
      <Text className="text-[13px] text-danger">{message}</Text>
    </View>
  );
}

export function EmptySpace({ height = 12 }: { height?: number }) {
  return <View style={{ height }} />;
}
