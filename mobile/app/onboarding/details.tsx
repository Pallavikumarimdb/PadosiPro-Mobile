import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ErrorBanner, Field, PrimaryButton } from '../../components/ui';
import { validateOnboarding } from '../../utils/validation';
import { profileService } from '../../services/padosi';
import { useAuth } from '../../store/AuthContext';

/** Screenshots 2-3 — "A few details" onboarding incl. Business Name (assignment requirement). */
export default function Details() {
  const { refresh } = useAuth();
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [society, setSociety] = useState('');
  const [flatUnit, setFlatUnit] = useState('');
  const [gateNotes, setGateNotes] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const errors = validateOnboarding(fullName, address);
  const showErrors = touched ? errors : {};

  async function onContinue() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    setServerError(null);
    try {
      await profileService.save({
        fullName: fullName.trim(),
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-canvas">
      <ScrollView className="flex-1 px-5 pt-10" keyboardShouldPersistTaps="handled">
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
          <Field
            label="Business name (optional)"
            placeholder="If this account is for a business"
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>
        <ErrorBanner message={serverError} />
        <View className="h-2" />
      </ScrollView>
      <View className="px-5 pb-6">
        {touched && errors.fullName ? (
          <Text className="mb-2 text-center text-[13px] text-muted">{errors.fullName}</Text>
        ) : null}
        <PrimaryButton title="Continue" loading={saving} loadingTitle="Saving..." onPress={onContinue} />
      </View>
    </KeyboardAvoidingView>
  );
}
