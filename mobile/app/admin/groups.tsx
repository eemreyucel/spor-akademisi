import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useGroups } from '@/hooks/use-groups';
import { AGE_CATEGORY_LABELS } from '@/lib/utils/age-category';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

export default function GroupsScreen() {
  const router = useRouter();
  const { groups, loading, refetch } = useGroups();

  if (loading && groups.length === 0) return <LoadingSpinner />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Gruplar',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/admin/group-create')}>
              <Text className="text-blue-600 font-medium text-base">+ Yeni</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-gray-50">
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
              <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
              <Text className="text-sm text-gray-500 mt-1">{item.sportName}</Text>
              <View className="flex-row gap-2 mt-2">
                <View className="bg-blue-50 px-2 py-0.5 rounded">
                  <Text className="text-xs text-blue-700 font-medium">
                    {AGE_CATEGORY_LABELS[item.ageCategory as keyof typeof AGE_CATEGORY_LABELS] ?? item.ageCategory}
                  </Text>
                </View>
                {item.coachName ? (
                  <View className="bg-gray-100 px-2 py-0.5 rounded">
                    <Text className="text-xs text-gray-600">{item.coachName}</Text>
                  </View>
                ) : (
                  <View className="bg-yellow-50 px-2 py-0.5 rounded">
                    <Text className="text-xs text-yellow-700">Antrenör atanmadı</Text>
                  </View>
                )}
              </View>
              {item.scheduleDescription ? (
                <Text className="text-xs text-gray-400 mt-2">{item.scheduleDescription}</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={<EmptyState message="Henüz grup oluşturulmamış." />}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#3b82f6" />
          }
        />
      </View>
    </>
  );
}
