import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { ErrorBanner, Field, Logo, PrimaryButton } from '../../components/ui';
import { authService } from '../../services/padosi';

/** Login: identifier (email or mobile) -> OTP is sent -> otp screen. */
export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!identifier.trim()) {
      setError('Enter your email or mobile number');
      return;
    }
    setError(undefined);
    setLoading(true);
    setServerError(null);
    try {
      const isEmail = identifier.trim().includes('@');
      const res = await authService.login(identifier.trim());
      router.push({
        pathname: '/auth/otp',
        params: {
          email: (res.email ?? (isEmail ? identifier.trim().toLowerCase() : '')).toLowerCase(),
          devOtp: res.devOtp ?? '',
          mode: 'login',
        },
      });
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-canvas">
      <ScrollView className="flex-1 px-5 pt-10" keyboardShouldPersistTaps="handled">
        <Logo />
        <Text className="mt-6 text-[28px] font-bold text-ink">Welcome back</Text>
        <Text className="mt-2 text-[15px] leading-6 text-muted">
          Enter your email or mobile number. We&apos;ll send the OTP to your email.
        </Text>
        <View className="mt-6">
          <Field
            label="Email or mobile number"
            icon="person-outline"
            placeholder="you@example.com or 98765 43210"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
            error={error}
          />
        </View>
        <ErrorBanner message={serverError} />
      </ScrollView>
      <View className="px-5 pb-6">
        <PrimaryButton title="Get OTP" loading={loading} loadingTitle="Sending OTP..." onPress={onLogin} />
        <View className="mt-4 flex-row justify-center">
          <Text className="text-sm text-muted">New here? </Text>
          <Link href="/auth/welcome" className="text-sm font-semibold text-primary">
            Create an account
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
