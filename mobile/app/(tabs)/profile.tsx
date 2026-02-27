import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici',
  coach: 'Antrenör',
  parent: 'Veli',
};

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { saving, error, updateProfile } = useProfile();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone ?? '');
      setProfession(profile.profession ?? '');
    }
  }, [profile]);

  if (!profile) {
    return <LoadingSpinner />;
  }

  const handleSave = async () => {
    setSuccessMsg('');
    const result = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
      profession: profession.trim(),
    });

    if (!result.error) {
      setSuccessMsg('Profil güncellendi.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Editable Fields */}
        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</Text>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Ad Soyad</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-white"
              value={fullName}
              onChangeText={setFullName}
              editable={!saving}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Telefon</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-white"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="05XX XXX XX XX"
              placeholderTextColor="#9ca3af"
              editable={!saving}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Meslek</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-white"
              value={profession}
              onChangeText={setProfession}
              placeholder="Mesleğiniz"
              placeholderTextColor="#9ca3af"
              editable={!saving}
            />
          </View>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <Text className="text-red-700 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <Text className="text-green-700 text-sm text-center">{successMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            className={`rounded-lg py-3 ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Read-only Info */}
        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Hesap Bilgileri</Text>

          <View className="mb-3">
            <Text className="text-sm text-gray-500">E-posta</Text>
            <Text className="text-base text-gray-900">{profile.email}</Text>
          </View>

          <View>
            <Text className="text-sm text-gray-500">Rol</Text>
            <Text className="text-base text-gray-900">
              {profile.roles.map((r) => ROLE_LABELS[r] ?? r).join(', ')}
            </Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          className="bg-white rounded-xl border border-red-200 py-4"
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text className="text-red-600 text-center font-semibold text-base">Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
