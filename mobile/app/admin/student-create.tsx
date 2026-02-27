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
import { useCreateStudent } from '@/hooks/use-create-student';
import { useGroups } from '@/hooks/use-groups';
import { calculateAgeCategory, AGE_CATEGORY_LABELS } from '@/lib/utils/age-category';
import { validateTcKimlik } from '@/lib/utils/tc-kimlik';
import { FormField } from '@/components/ui/form-field';
import { PickerField } from '@/components/ui/picker-field';

export default function StudentCreateScreen() {
  const router = useRouter();
  const { creating, error, createStudent } = useCreateStudent();
  const { groups } = useGroups();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [tcKimlik, setTcKimlik] = useState('');
  const [school, setSchool] = useState('');
  const [address, setAddress] = useState('');
  const [groupId, setGroupId] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [localError, setLocalError] = useState('');

  // Calculate age category preview
  const ageCategory = dob ? calculateAgeCategory(new Date(dob)) : null;

  const handleSave = async () => {
    setLocalError('');

    if (!fullName.trim()) {
      setLocalError('Ad soyad gereklidir.');
      return;
    }
    if (!dob.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      setLocalError('Doğum tarihi YYYY-AA-GG formatında olmalıdır.');
      return;
    }
    if (tcKimlik && !validateTcKimlik(tcKimlik)) {
      setLocalError('TC Kimlik numarası geçerli değil.');
      return;
    }

    const result = await createStudent({
      fullName: fullName.trim(),
      dob: dob.trim(),
      tcKimlik: tcKimlik.trim() || undefined,
      school: school.trim() || undefined,
      address: address.trim() || undefined,
      groupId: groupId || undefined,
      monthlyFee: monthlyFee ? parseFloat(monthlyFee) : undefined,
    });

    if (!result.error) {
      Alert.alert('Başarılı', 'Öğrenci oluşturuldu.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    }
  };

  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: `${g.name} (${g.sportName})`,
  }));

  return (
    <>
      <Stack.Screen options={{ title: 'Öğrenci Ekle' }} />
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
              label="Ad Soyad *"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Öğrenci adı soyadı"
              editable={!creating}
            />

            <FormField
              label="Doğum Tarihi *"
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-AA-GG"
              editable={!creating}
            />

            {ageCategory && (
              <View className="bg-blue-50 px-3 py-2 rounded-lg mb-4">
                <Text className="text-sm text-blue-700">
                  Yaş Kategorisi: {AGE_CATEGORY_LABELS[ageCategory]}
                </Text>
              </View>
            )}

            <FormField
              label="TC Kimlik No"
              value={tcKimlik}
              onChangeText={setTcKimlik}
              placeholder="11 haneli TC kimlik"
              keyboardType="number-pad"
              maxLength={11}
              editable={!creating}
            />

            <FormField
              label="Okul"
              value={school}
              onChangeText={setSchool}
              placeholder="Okul adı"
              editable={!creating}
            />

            <FormField
              label="Adres"
              value={address}
              onChangeText={setAddress}
              placeholder="Adres"
              multiline
              editable={!creating}
            />
          </View>

          {/* Optional Enrollment */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Gruba Kayıt (Opsiyonel)
            </Text>

            <PickerField
              label="Grup"
              value={groupId}
              options={groupOptions}
              onValueChange={setGroupId}
              placeholder="Grup seçin..."
            />

            {groupId ? (
              <FormField
                label="Aylık Ücret (TL)"
                value={monthlyFee}
                onChangeText={setMonthlyFee}
                placeholder="0"
                keyboardType="decimal-pad"
                editable={!creating}
              />
            ) : null}
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
                Öğrenci Oluştur
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
