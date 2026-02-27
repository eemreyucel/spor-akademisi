import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';

export default function ChildLayout() {
  const router = useRouter();

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
