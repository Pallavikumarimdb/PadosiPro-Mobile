import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackButton, Chip, ErrorBanner, PrimaryButton, Screen, SectionCard } from '../../components/ui';
import { RELATIONS, householdService, type HouseholdMember } from '../../services/padosi';

/** Household (Account > Household): empty state, add form, member list, delete — all persisted. */
export default function Household() {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await householdService.list();
      setMembers(res.members ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load household.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openForm() {
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setName('');
    setRelation(null);
    setNotes('');
    setFormError(null);
  }

  async function onAdd() {
    if (name.trim().length < 2) {
      setFormError('Enter a name');
      return;
    }
    if (!relation) {
      setFormError('Pick a relation');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await householdService.add({ name: name.trim(), relation, notes: notes.trim() || undefined });
      setMembers((m) => [...m, res.member]);
      closeForm();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not add. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    setDeletingId(id);
    try {
      await householdService.remove(id);
      setMembers((m) => m.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="pt-4">
          <BackButton />
          <Text className="mt-2 text-[24px] font-bold text-ink">Household</Text>
          <Text className="mt-1 text-[13px] leading-5 text-muted">
            Add the people (and pets) in your household so your Lifestyle Manager has the full picture — especially
            useful if you&apos;re coordinating care from abroad.
          </Text>
        </View>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0C5B40" />
          </View>
        ) : (
          <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <ErrorBanner message={error} />
            {members.length === 0 && !formOpen ? (
              <SectionCard>
                <Ionicons name="people-outline" size={22} color="#64748B" />
                <Text className="mt-2 text-[15px] font-bold text-ink">No one added yet</Text>
                <Text className="mt-1 text-[13px] text-muted">
                  Add family members so requests can be tied to the right person.
                </Text>
              </SectionCard>
            ) : null}

            {members.map((m) => (
              <SectionCard key={m.id}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold text-ink">{m.name}</Text>
                    <Text className="mt-0.5 text-[12px] font-semibold text-gold">{m.relation}</Text>
                    {m.notes ? <Text className="mt-1.5 text-[13px] text-muted">{m.notes}</Text> : null}
                  </View>
                  <Pressable onPress={() => onDelete(m.id)} disabled={deletingId === m.id} hitSlop={12} className="ml-3 p-1">
                    {deletingId === m.id ? (
                      <ActivityIndicator size="small" color="#94A3B8" />
                    ) : (
                      <Ionicons name="trash-outline" size={18} color="#94A3B8" />
                    )}
                  </Pressable>
                </View>
              </SectionCard>
            ))}

            {formOpen ? (
              <SectionCard>
                <Text className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Add someone</Text>
                <View className="rounded-xl border border-line bg-card px-4" style={{ minHeight: 56, justifyContent: 'center' }}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Name"
                    placeholderTextColor="#94A3B8"
                    className="py-3 text-[15px] text-ink"
                  />
                </View>
                <View className="mt-3 flex-row flex-wrap">
                  {RELATIONS.map((r) => (
                    <Chip key={r} label={r} selected={relation === r} onPress={() => setRelation(r)} />
                  ))}
                </View>
                <View className="mt-1 rounded-xl border border-line bg-card p-4" style={{ minHeight: 88 }}>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Notes (optional) — e.g. prefers morning appointments"
                    placeholderTextColor="#94A3B8"
                    multiline
                    textAlignVertical="top"
                    className="flex-1 text-[15px] text-ink"
                  />
                </View>
                {formError ? <Text className="mt-2 text-[13px] text-danger">{formError}</Text> : null}
                <View className="mt-3">
                  <PrimaryButton
                    title="Add to household"
                    loading={saving}
                    loadingTitle="Adding..."
                    onPress={onAdd}
                    disabled={!name.trim() || !relation}
                  />
                </View>
                <Pressable onPress={closeForm} className="mt-3 items-center py-1" hitSlop={8}>
                  <Text className="text-[13px] text-muted">Cancel</Text>
                </Pressable>
              </SectionCard>
            ) : (
              <Pressable
                onPress={openForm}
                className="mb-6 flex-row items-center justify-center rounded-xl border border-dashed border-primary bg-card py-4"
              >
                <Ionicons name="person-add-outline" size={16} color="#0C5B40" />
                <Text className="ml-2 text-[14px] font-semibold text-primary">Add a family member</Text>
              </Pressable>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
