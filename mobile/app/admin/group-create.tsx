import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useCreateGroup } from '@/hooks/use-create-group';
import { AGE_CATEGORY_LABELS } from '@/lib/utils/age-category';
import { FormField } from '@/components/ui/form-field';
import { PickerField } from '@/components/ui/picker-field';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GroupCreateScreen() {
  const router = useRouter();
  const { sports, coaches, loading, creating, error, createGroup } = useCreateGroup();

  const [name, setName] = useState('');
  const [sportId, setSportId] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [coachProfileId, setCoachProfileId] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [localError, setLocalError] = useState('');

  if (loading) return <LoadingSpinner />;

  const handleSave = async () => {
    setLocalError('');

    if (!name.trim()) {
      setLocalError('Grup adı gereklidir.');
      return;
    }
    if (!sportId) {
      setLocalError('Spor branşı seçilmelidir.');
      return;
    }
    if (!ageCategory) {
      setLocalError('Yaş kategorisi seçilmelidir.');
      return;
    }

    const result = await createGroup({
      name: name.trim(),
      sportId,
      ageCategory,
      coachProfileId: coachProfileId || undefined,
      scheduleDescription: scheduleDescription.trim() || undefined,
    });

    if (!result.error) {
      Alert.alert('Başarılı', 'Grup oluşturuldu.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    }
  };

  const sportOptions = sports.map((s) => ({ value: s.id, label: s.name }));
  const ageCategoryOptions = Object.entries(AGE_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  const coachOptions = coaches.map((c) => ({ value: c.profileId, label: c.fullName }));

  return (
    <>
      <Stack.Screen options={{ title: 'Grup Oluştur' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <FormField
              label="Grup Adı *"
              value={name}
              onChangeText={setName}
              placeholder="Grup adı"
              editable={!creating}
            />

            <PickerField
              label="Spor Branşı *"
              value={sportId}
              options={sportOptions}
              onValueChange={setSportId}
              placeholder="Spor seçin..."
            />

            <PickerField
              label="Yaş Kategorisi *"
              value={ageCategory}
              options={ageCategoryOptions}
              onValueChange={setAgeCategory}
              placeholder="Kategori seçin..."
            />

            <PickerField
              label="Antrenör"
              value={coachProfileId}
              options={coachOptions}
              onValueChange={setCoachProfileId}
              placeholder="Antrenör seçin (opsiyonel)..."
            />

            <FormField
              label="Program Açıklaması"
              value={scheduleDescription}
              onChangeText={setScheduleDescription}
              placeholder="Örn: Pazartesi-Çarşamba 16:00-17:30"
              multiline
              editable={!creating}
            />
          </View>

          {(localError || error) ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-700 text-sm text-center">{localError || error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            className={`rounded-lg py-4 ${creating ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleSave}
            disabled={creating}
            activeOpacity={0.8}
          >
            {creating ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Grup Oluştur
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
