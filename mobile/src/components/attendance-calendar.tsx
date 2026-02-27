import { View, Text } from 'react-native';
import type { AttendanceStatus } from '@/types/database';

interface AttendanceDay {
  date: string;
  status: AttendanceStatus;
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-green-400',
  absent_unexcused: 'bg-red-400',
  absent_excused: 'bg-yellow-400',
};

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Katıldı',
  absent_unexcused: 'Gelmedi',
  absent_excused: 'Mazeretli',
};

export function AttendanceCalendar({ records }: { records: AttendanceDay[] }) {
  const recordMap = new Map(records.map((r) => [r.date, r.status]));

  // Generate last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <View>
      <View className="flex-row flex-wrap gap-1">
        {days.map((day) => {
          const status = recordMap.get(day);
          return (
            <View
              key={day}
              className={`w-6 h-6 rounded ${status ? STATUS_COLORS[status] : 'bg-gray-100'}`}
            />
          );
        })}
      </View>

      <View className="flex-row gap-4 mt-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded bg-green-400" />
          <Text className="text-xs text-gray-500">Katıldı</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded bg-red-400" />
          <Text className="text-xs text-gray-500">Gelmedi</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded bg-yellow-400" />
          <Text className="text-xs text-gray-500">Mazeretli</Text>
        </View>
      </View>
    </View>
  );
}
