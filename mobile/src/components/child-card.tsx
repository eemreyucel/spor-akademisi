import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { ChildItem } from '@/hooks/use-children';

const AGE_LABELS: Record<string, string> = {
  minik_a: 'Minik A',
  minik_b: 'Minik B',
  kucukler: 'Küçükler',
  yildizlar: 'Yıldızlar',
  gencler: 'Gençler',
};

export function ChildCard({ child }: { child: ChildItem }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="bg-white rounded-xl border border-gray-200 p-4 mb-3"
      onPress={() => router.push(`/child/${child.studentId}`)}
      activeOpacity={0.7}
    >
      <Text className="text-lg font-semibold text-gray-900">{child.studentName}</Text>

      {child.groupName ? (
        <Text className="text-sm text-gray-500 mt-1">
          {child.sportName} — {child.groupName}
        </Text>
      ) : (
        <Text className="text-sm text-yellow-600 mt-1">Henüz bir gruba atanmamış</Text>
      )}

      {child.ageCategory ? (
        <View className="mt-2">
          <View className="bg-blue-50 self-start px-2 py-0.5 rounded">
            <Text className="text-xs text-blue-700 font-medium">
              {AGE_LABELS[child.ageCategory] ?? child.ageCategory}
            </Text>
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
