import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { ErrorBanner, Field, Logo, PrimaryButton } from '../../components/ui';
import { validateWelcome } from '../../utils/validation';
import { authService } from '../../services/padosi';

/** Screenshot 0 — Welcome / Register: mobile + email -> Get OTP. */
export default function Welcome() {
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ mobile?: string; email?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onGetOtp() {
    const validation = validateWelcome(mobile, email);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setLoading(true);
    setServerError(null);
    try {
      const res = await authService.register(email.trim(), mobile.trim());
      router.push({
        pathname: '/auth/otp',
        params: { email: email.trim().toLowerCase(), devOtp: res.devOtp ?? '', mode: 'register' },
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
        <Text className="mt-6 text-[28px] font-bold text-ink">Welcome</Text>
        <Text className="mt-2 text-[15px] leading-6 text-muted">
          Enter your mobile number and email. We&apos;ll send the OTP to your email.
        </Text>

        <View className="mt-6">
          <Field
            label="Mobile number"
            icon="call-outline"
            prefix="+91"
            placeholder="98765 43210"
            keyboardType="number-pad"
            maxLength={13}
            value={mobile}
            onChangeText={setMobile}
            error={errors.mobile}
          />
          <Field
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
        </View>
        <ErrorBanner message={serverError} />
      </ScrollView>
      <View className="px-5 pb-6">
        <PrimaryButton title="Get OTP" loading={loading} loadingTitle="Sending OTP..." onPress={onGetOtp} />
        <View className="mt-4 flex-row justify-center">
          <Text className="text-sm text-muted">Already registered? </Text>
          <Link href="/auth/login" className="text-sm font-semibold text-primary">
            Log in
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
