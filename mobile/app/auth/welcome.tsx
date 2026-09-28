import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { BottomBar, ErrorBanner, Field, Logo, PrimaryButton } from '../../components/ui';
import { validateRegister } from '../../utils/validation';
import { authService } from '../../services/padosi';

// Module-level variable: safer than URL params (never stored in nav history)
let _pendingDevOtp: string | undefined;
export function setDevOtp(code: string | undefined) {
  _pendingDevOtp = code;
}
export function getAndClearDevOtp(): string | undefined {
  const v = _pendingDevOtp;
  _pendingDevOtp = undefined;
  return v;
}

export default function Welcome() {
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<{ mobile?: string; email?: string; password?: string; confirm?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(fields = { mobile, email, password, confirm }) {
    const errs = validateRegister(fields.mobile, fields.email, fields.password, fields.confirm);
    setErrors(errs);
    return errs;
  }

  function handleFieldChange(name: 'mobile' | 'email' | 'password' | 'confirm', val: string) {
    const updated = { mobile, email, password, confirm, [name]: val };
    if (name === 'mobile') setMobile(val);
    if (name === 'email') setEmail(val);
    if (name === 'password') setPassword(val);
    if (name === 'confirm') setConfirm(val);

    if (touched[name]) {
      const errs = validateRegister(updated.mobile, updated.email, updated.password, updated.confirm);
      setErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  }

  function handleBlur(name: 'mobile' | 'email' | 'password' | 'confirm') {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validateRegister(mobile, email, password, confirm);
    setErrors((prev) => ({ ...prev, [name]: errs[name] }));
  }

  async function onGetOtp() {
    setTouched({ mobile: true, email: true, password: true, confirm: true });
    const validation = validate();
    if (Object.keys(validation).length > 0) return;
    setLoading(true);
    setServerError(null);
    try {
      const res = await authService.register(email.trim(), mobile.trim(), password);
      setDevOtp(res.devOtp);  // store out-of-band, not in URL
      router.push({
        pathname: '/auth/otp',
        params: { email: email.trim().toLowerCase(), mode: 'register' },
      });
    } catch (e) {
      const shouldLogin = (e as { shouldLogin?: boolean })?.shouldLogin;
      if (shouldLogin) {
        // Server says this email is already registered → send them to login
        setServerError('This email is already registered. Redirecting to log in…');
        setTimeout(() => {
          router.replace({ pathname: '/auth/login', params: { email: email.trim().toLowerCase() } });
        }, 1200);
      } else {
        setServerError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      }
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
            onChangeText={(v) => handleFieldChange('mobile', v)}
            onBlur={() => handleBlur('mobile')}
            error={touched.mobile ? errors.mobile : undefined}
          />
          <Field
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => handleFieldChange('email', v)}
            onBlur={() => handleBlur('email')}
            error={touched.email ? errors.email : undefined}
          />
          <Field
            label="Password"
            icon="lock-closed-outline"
            placeholder="Minimum 8 characters"
            secureTextEntry
            secureToggle
            value={password}
            onChangeText={(v) => handleFieldChange('password', v)}
            onBlur={() => handleBlur('password')}
            error={touched.password ? errors.password : undefined}
          />
          <Field
            label="Confirm password"
            icon="lock-closed-outline"
            placeholder="Repeat your password"
            secureTextEntry
            secureToggle
            value={confirm}
            onChangeText={(v) => handleFieldChange('confirm', v)}
            onBlur={() => handleBlur('confirm')}
            error={touched.confirm ? errors.confirm : undefined}
          />
        </View>
        <ErrorBanner message={serverError} />
      </ScrollView>
      <BottomBar>
        <PrimaryButton title="Get OTP" loading={loading} loadingTitle="Sending OTP..." onPress={onGetOtp} />
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
