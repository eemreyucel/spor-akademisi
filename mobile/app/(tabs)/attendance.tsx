import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useGroups } from '@/hooks/use-groups';
import { useAttendanceTaking } from '@/hooks/use-attendance-taking';
import { GroupSelector } from '@/components/group-selector';
import { AttendanceRow } from '@/components/attendance-row';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

export default function AttendanceScreen() {
  const { groups, loading: groupsLoading } = useGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { students, loading, saving, saved, error, toggleStatus, saveAttendance } =
    useAttendanceTaking(selectedGroupId);

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (groupsLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={students}
        keyExtractor={(item) => item.enrollmentId}
        renderItem={({ item }) => (
          <View className="mx-4">
            <AttendanceRow
              studentName={item.studentName}
              status={item.status}
              onToggle={() => toggleStatus(item.enrollmentId)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            <Text className="text-sm text-gray-500 text-center py-2">{today}</Text>
            {groups.length > 0 ? (
              <GroupSelector
                groups={groups}
                selectedId={selectedGroupId}
                onSelect={setSelectedGroupId}
              />
            ) : (
              <View className="px-4 py-2">
                <Text className="text-gray-400 text-center">Atanmış grup bulunamadı.</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingSpinner />
          ) : selectedGroupId ? (
            <EmptyState message="Bu grupta aktif öğrenci yok." />
          ) : (
            <EmptyState message="Yoklama almak için bir grup seçin." />
          )
        }
      />

      {/* Save Button */}
      {students.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          {error ? (
            <Text className="text-red-600 text-sm text-center mb-2">{error}</Text>
          ) : null}
          {saved ? (
            <Text className="text-green-600 text-sm text-center mb-2">
              Yoklama kaydedildi!
            </Text>
          ) : null}
          <TouchableOpacity
            className={`rounded-lg py-4 ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={saveAttendance}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Yoklamayı Kaydet
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
