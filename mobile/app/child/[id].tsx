import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useChildDetail } from '@/hooks/use-child-detail';
import { AttendanceCalendar } from '@/components/attendance-calendar';
import { PaymentRow } from '@/components/payment-row';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AGE_LABELS: Record<string, string> = {
  minik_a: 'Minik A',
  minik_b: 'Minik B',
  kucukler: 'Küçükler',
  yildizlar: 'Yıldızlar',
  gencler: 'Gençler',
};

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { detail, loading, refetch } = useChildDetail(id);

  if (loading && !detail) {
    return <LoadingSpinner />;
  }

  if (!detail) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-400">Öğrenci bulunamadı.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: detail.studentName }} />
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#3b82f6" />
        }
      >
        {/* Student Info */}
        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Text className="text-xl font-bold text-gray-900">{detail.studentName}</Text>
          <View className="flex-row gap-3 mt-2">
            <View className="bg-blue-50 px-2 py-0.5 rounded">
              <Text className="text-xs text-blue-700 font-medium">
                {AGE_LABELS[detail.ageCategory] ?? detail.ageCategory}
              </Text>
            </View>
            <Text className="text-sm text-gray-500">Doğum: {detail.dob}</Text>
          </View>
        </View>

        {/* Enrollments */}
        {detail.enrollments.map((enrollment) => (
          <View key={enrollment.enrollmentId} className="mb-4">
            {/* Group Info */}
            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-2">
              <Text className="text-base font-semibold text-gray-900">
                {enrollment.sportName} — {enrollment.groupName}
              </Text>
              {enrollment.scheduleDescription ? (
                <Text className="text-sm text-gray-500 mt-1">
                  {enrollment.scheduleDescription}
                </Text>
              ) : null}
            </View>

            {/* Attendance */}
            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-2">
              <Text className="text-sm font-semibold text-gray-900 mb-3">
                Yoklama (Son 30 Gün)
              </Text>
              <AttendanceCalendar records={enrollment.attendance} />
            </View>

            {/* Payments */}
            <View className="bg-white rounded-xl border border-gray-200 p-4">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Ödemeler</Text>
              {enrollment.payments.length > 0 ? (
                enrollment.payments.map((p) => (
                  <PaymentRow
                    key={p.id}
                    periodMonth={p.periodMonth}
                    amount={p.amount}
                    status={p.status}
                    dueDate={p.dueDate}
                  />
                ))
              ) : (
                <Text className="text-gray-400 text-sm py-2">Ödeme kaydı yok.</Text>
              )}
            </View>
          </View>
        ))}

        {detail.enrollments.length === 0 && (
          <View className="bg-white rounded-xl border border-gray-200 p-4">
            <Text className="text-yellow-600 text-sm">Henüz bir gruba atanmamış.</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
