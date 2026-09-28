import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, KeyboardEvent, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BottomBar, ErrorBanner, Field, PrimaryButton } from '../../components/ui';
import { validateOnboarding } from '../../utils/validation';
import { profileService } from '../../services/padosi';
import { useAuth } from '../../store/AuthContext';

export default function Details() {
  const { refresh, user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const businessNameY = useRef<number>(0);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState(user?.mobile ?? '');
  const [address, setAddress] = useState('');
  const [society, setSociety] = useState('');
  const [flatUnit, setFlatUnit] = useState('');
  const [gateNotes, setGateNotes] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardVisible = keyboardHeight > 0;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const errors = validateOnboarding(fullName, address, mobile);
  const showErrors = touched ? errors : {};

  async function onContinue() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    setServerError(null);
    try {
      await profileService.save({
        fullName: fullName.trim(),
        mobile: mobile.trim() || undefined,
        address: address.trim(),
        city: 'Mumbai',
        society: society.trim() || null,
        flatUnit: flatUnit.trim() || null,
        gateNotes: gateNotes.trim() || null,
        businessName: businessName.trim() || null,
      });
      await refresh();
      router.replace('/main/home');
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  /** Scroll so the business name field is fully visible above the keyboard. */
  function scrollToBusinessName() {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: businessNameY.current, animated: true });
    }, 100);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 py-6 bg-canvas">
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5 pt-10"
        contentContainerStyle={{ paddingBottom: keyboardVisible ? keyboardHeight + 54 : 30 }}
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[12px] font-bold uppercase tracking-widest text-gold">Mumbai</Text>
        <Text className="mt-2 text-[28px] font-bold text-ink">A few details</Text>
        <Text className="mt-2 text-[15px] leading-6 text-muted">
          So your Lifestyle Manager can coordinate visits and deliveries smoothly.
        </Text>

        <View className="mt-6">
          <Field
            label="Full name"
            placeholder="As you would like us to use"
            value={fullName}
            onChangeText={setFullName}
            error={showErrors.fullName}
          />
          <Field
            label="Mobile number"
            icon="call-outline"
            prefix="+91"
            placeholder="98765 43210"
            keyboardType="number-pad"
            maxLength={13}
            value={mobile.replace(/^(\+91\s*|0)/, '')}
            onChangeText={(v) => setMobile(v)}
            error={showErrors.mobile}
          />
          <Field
            label="Address & area"
            placeholder="Road, area, landmark"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 88 }}
            error={showErrors.address}
          />
          <Field
            label="Society / building (optional)"
            placeholder="Name as on the gate"
            value={society}
            onChangeText={setSociety}
          />
          <Field
            label="Flat / unit (optional)"
            placeholder="e.g. Tower B, 1204"
            value={flatUnit}
            onChangeText={setFlatUnit}
          />
          <Field
            label="Gate or entry notes (optional)"
            placeholder="Anything the team should know at entry"
            value={gateNotes}
            onChangeText={setGateNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 88 }}
          />
          <View onLayout={(e) => { businessNameY.current = e.nativeEvent.layout.y; }}>
            <Field
              label="Business name (optional)"
              placeholder="If this account is for a business"
              value={businessName}
              onChangeText={setBusinessName}
              onFocus={scrollToBusinessName}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
        </View>
        <ErrorBanner message={serverError} />
        <View className="h-6" />
      </ScrollView>
      {!keyboardVisible ? (
        <BottomBar>
          {touched && errors.fullName ? (
            <Text className="mb-2 text-center text-[13px] text-muted">{errors.fullName}</Text>
          ) : null}
          <PrimaryButton title="Continue" loading={saving} loadingTitle="Saving..." onPress={onContinue} />
        </BottomBar>
      ) : null}
    </KeyboardAvoidingView>
  );
}
