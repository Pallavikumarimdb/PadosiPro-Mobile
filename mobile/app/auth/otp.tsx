import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton, BottomBar, ErrorBanner, Logo, OtpInput, PrimaryButton } from '../../components/ui';
import { authService } from '../../services/padosi';
import { useAuth } from '../../store/AuthContext';
import { getAndClearDevOtp } from './welcome';

/** Screenshot 1 — Enter OTP: 6-digit input, resend, Verify. */
export default function Otp() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { signInWithToken } = useAuth();
  const [code, setCode] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  // Read dev OTP from module store (not URL params, to avoid nav history exposure)
  const [devCode, setDevCode] = useState<string | undefined>(getAndClearDevOtp);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function onVerify() {
    if (!/^\d{6}$/.test(code)) {
      setFieldError('Enter the 6-digit code');
      return;
    }
    setFieldError(undefined);
    setVerifying(true);
    setServerError(null);
    try {
      const res = await authService.verifyOtp((email ?? '').toLowerCase(), code);
      await signInWithToken(res.token, res.user, res.profile);
      router.replace(res.user.profileComplete ? '/main/home' : '/onboarding/details');
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  async function onResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setServerError(null);
    try {
      const res = await authService.sendOtp((email ?? '').toLowerCase());
      setDevCode(res.devOtp);
      setNotice('A new code was sent to your email.');
      setCooldown(30);
    } catch (e: unknown) {
      const seconds = (e as { resendInSeconds?: number })?.resendInSeconds;
      if (seconds) setCooldown(seconds);
      setServerError(e instanceof Error ? e.message : 'Could not resend. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-canvas">
      <ScrollView className="flex-1 px-5 pt-4" keyboardShouldPersistTaps="handled">
        <BackButton />
        <View className="mt-2">
          <Logo />
        </View>
        <Text className="mt-6 text-[28px] font-bold text-ink">Enter OTP</Text>
        <Text className="mt-2 text-[15px] leading-6 text-muted">
          We&apos;ve sent a code to {email || 'your email'}. It expires in 10 minutes.
        </Text>

        <Text className="mb-2 mt-6 text-[13px] font-medium text-muted">6-digit code</Text>
        <OtpInput value={code} onChange={(v) => { setCode(v); setFieldError(undefined); }} />
        {fieldError ? <Text className="mt-1.5 text-[13px] text-danger">{fieldError}</Text> : null}

        <Pressable onPress={onResend} disabled={cooldown > 0 || resending} className="mt-4 self-start" hitSlop={8}>
          <Text className={`text-[14px] font-semibold ${cooldown > 0 ? 'text-faint' : 'text-primary'}`}>
            {resending ? 'Sending...' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </Text>
        </Pressable>

        <View className="mt-4">
          <ErrorBanner message={serverError} />
          {notice ? <Text className="text-[13px] text-primary">{notice}</Text> : null}
          {__DEV__ && devCode ? (
            <View className="mt-2 rounded-xl border border-dashed border-gold bg-goldSoft p-3">
              <Text className="text-[13px] text-ink">Dev OTP (no email provider in local dev): {devCode}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <BottomBar>
        <PrimaryButton title="Verify" loading={verifying} loadingTitle="Verifying..." onPress={onVerify} />
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
