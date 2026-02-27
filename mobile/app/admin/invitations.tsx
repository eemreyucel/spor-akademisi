import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useInvitations } from '@/hooks/use-invitations';
import { useAllStudents } from '@/hooks/use-all-students';
import { InvitationCard } from '@/components/invitation-card';
import { PickerField } from '@/components/ui/picker-field';
import { FormField } from '@/components/ui/form-field';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import type { UserRole } from '@/types/database';

const ROLE_OPTIONS = [
  { value: 'parent', label: 'Veli' },
  { value: 'coach', label: 'Antrenör' },
  { value: 'admin', label: 'Yönetici' },
];

export default function InvitationsScreen() {
  const {
    invitations,
    loading,
    creating,
    error,
    refetch,
    createInvitation,
    deleteInvitation,
    getInviteLink,
  } = useInvitations();
  const { students } = useAllStudents();

  const [role, setRole] = useState<string>('parent');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreate = async () => {
    setSuccessMsg('');
    const result = await createInvitation({
      role: role as UserRole,
      email: email.trim() || undefined,
      studentId: role === 'parent' && studentId ? studentId : undefined,
    });

    if (!result.error) {
      setEmail('');
      setStudentId('');
      setSuccessMsg('Davet oluşturuldu!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleCopy = async (id: string, token: string) => {
    const link = getInviteLink(token);
    await Clipboard.setStringAsync(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: s.fullName,
  }));

  if (loading && invitations.length === 0) return <LoadingSpinner />;

  return (
    <>
      <Stack.Screen options={{ title: 'Davetler' }} />
      <View className="flex-1 bg-gray-50">
        <FlatList
          data={invitations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">Yeni Davet</Text>

              <PickerField
                label="Rol"
                value={role}
                options={ROLE_OPTIONS}
                onValueChange={setRole}
              />

              <FormField
                label="E-posta (Opsiyonel)"
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!creating}
              />

              {role === 'parent' && (
                <PickerField
                  label="Öğrenci (Opsiyonel)"
                  value={studentId}
                  options={studentOptions}
                  onValueChange={setStudentId}
                  placeholder="Öğrenci seçin..."
                />
              )}

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
                className={`rounded-lg py-3 ${creating ? 'bg-blue-400' : 'bg-blue-600'}`}
                onPress={handleCreate}
                disabled={creating}
                activeOpacity={0.8}
              >
                {creating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-center font-semibold text-sm">
                    Davet Oluştur
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <InvitationCard
              invitation={item}
              onCopy={() => handleCopy(item.id, item.token)}
              onDelete={() => deleteInvitation(item.id)}
              copied={copiedId === item.id}
            />
          )}
          ListEmptyComponent={<EmptyState message="Henüz davet oluşturulmamış." />}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#3b82f6" />
          }
        />
      </View>
    </>
  );
}
