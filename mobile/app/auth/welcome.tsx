import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { BottomBar, ErrorBanner, Field, Logo, PrimaryButton } from '../../components/ui';
import { validateRegister } from '../../utils/validation';
import { authService } from '../../services/padosi';

/** Register: mobile + email + password -> OTP verification. */
export default function Welcome() {
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ mobile?: string; email?: string; password?: string; confirm?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onGetOtp() {
    const validation = validateRegister(mobile, email, password, confirm);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setLoading(true);
    setServerError(null);
    try {
      const res = await authService.register(email.trim(), mobile.trim(), password);
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

  // Button stays disabled until all fields are valid (matches the muted CTA in the reference).
  const isFormValid = Object.keys(validateRegister(mobile, email, password, confirm)).length === 0;

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
          <Field
            label="Password"
            icon="lock-closed-outline"
            placeholder="Minimum 8 characters"
            secureTextEntry
            secureToggle
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
          <Field
            label="Confirm password"
            icon="lock-closed-outline"
            placeholder="Repeat your password"
            secureTextEntry
            secureToggle
            value={confirm}
            onChangeText={setConfirm}
            error={errors.confirm}
          />
        </View>
        <ErrorBanner message={serverError} />
      </ScrollView>
      <BottomBar>
        <PrimaryButton title="Get OTP" loading={loading} loadingTitle="Sending OTP..." onPress={onGetOtp} disabled={!isFormValid} />
        <View className="mt-4 flex-row justify-center">
          <Text className="text-sm text-muted">Already registered? </Text>
          <Link href="/auth/login" className="text-sm font-semibold text-primary">
            Log in
          </Link>
        </View>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
