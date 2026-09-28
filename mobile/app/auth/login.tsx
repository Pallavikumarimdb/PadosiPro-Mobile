import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { BottomBar, ErrorBanner, Field, Logo, PrimaryButton } from '../../components/ui';
import { authService } from '../../services/padosi';
import { useAuth } from '../../store/AuthContext';

/** Login: email/mobile + password. Verified users get a token; unverified go to OTP. */
export default function Login() {
  const { signInWithToken } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    const validation: typeof errors = {};
    if (!identifier.trim()) validation.identifier = 'Enter your email or mobile number';
    if (!password) validation.password = 'Enter your password';
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setLoading(true);
    setServerError(null);
    try {
      const res = await authService.login(identifier.trim(), password);
      await signInWithToken(res.token, res.user, res.profile);
      router.replace(res.user.profileComplete ? '/main/home' : '/onboarding/details');
    } catch (e) {
      const needsVerification = (e as { needsVerification?: boolean })?.needsVerification;
      const verifyEmail = (e as { email?: string })?.email;
      if (needsVerification && verifyEmail) {
        // Password was right but the email isn't verified: send a fresh OTP and route there.
        try {
          const otpRes = await authService.sendOtp(verifyEmail);
          router.push({
            pathname: '/auth/otp',
            params: { email: verifyEmail, devOtp: otpRes.devOtp ?? '', mode: 'login' },
          });
        } catch {
          setServerError(e instanceof Error ? e.message : 'Please verify your email first.');
        } finally {
          setLoading(false);
        }
        return;
      }
      setServerError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const isFormValid = identifier.trim().length > 0 && password.length > 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-canvas">
      <ScrollView className="flex-1 px-5 pt-10" keyboardShouldPersistTaps="handled">
        <Logo />
        <Text className="mt-6 text-[28px] font-bold text-ink">Welcome back</Text>
        <Text className="mt-2 text-[15px] leading-6 text-muted">
          Log in with your email or mobile number and password.
        </Text>
        <View className="mt-6">
          <Field
            label="Email or mobile number"
            icon="person-outline"
            placeholder="you@example.com or 98765 43210"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
            error={errors.identifier}
          />
          <Field
            label="Password"
            icon="lock-closed-outline"
            placeholder="Your password"
            secureTextEntry
            secureToggle
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
        </View>
        <ErrorBanner message={serverError} />
      </ScrollView>
      <BottomBar>
        <PrimaryButton title="Log in" loading={loading} loadingTitle="Logging in..." onPress={onLogin} disabled={!isFormValid} />
        <View className="mt-4 flex-row justify-center">
          <Text className="text-sm text-muted">New here? </Text>
          <Link href="/auth/welcome" className="text-sm font-semibold text-primary">
            Create an account
          </Link>
        </View>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
