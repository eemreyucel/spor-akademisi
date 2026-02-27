import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { getPrimaryRole } from '@/lib/utils/role-helpers';
import { TouchableOpacity, Text } from 'react-native';

export default function AdminLayout() {
  const { profile } = useAuth();
  const router = useRouter();
  const role = profile ? getPrimaryRole(profile.roles) : 'parent';

  if (role !== 'admin') {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text className="text-blue-600 text-base font-medium">← Geri</Text>
          </TouchableOpacity>
        ),
      }}
    />
  );
}
