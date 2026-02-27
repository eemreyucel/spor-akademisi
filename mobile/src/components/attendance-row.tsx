import { View, Text, TouchableOpacity } from 'react-native';
import type { AttendanceStatus } from '@/types/database';

interface AttendanceRowProps {
  studentName: string;
  status: AttendanceStatus;
  onToggle: () => void;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; bg: string; dot: string }> = {
  present: { label: 'Katıldı', bg: 'bg-green-50', dot: 'bg-green-500' },
  absent_unexcused: { label: 'Gelmedi', bg: 'bg-red-50', dot: 'bg-red-500' },
  absent_excused: { label: 'Mazeretli', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
};

export function AttendanceRow({ studentName, status, onToggle }: AttendanceRowProps) {
  const config = STATUS_CONFIG[status];

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${config.bg}`}
      onPress={onToggle}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View className={`w-4 h-4 rounded-full ${config.dot}`} />
        <Text className="text-base text-gray-900 font-medium">{studentName}</Text>
      </View>
      <Text className="text-sm text-gray-600">{config.label}</Text>
    </TouchableOpacity>
  );
}
