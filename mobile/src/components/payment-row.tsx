import { View, Text } from 'react-native';
import { StatusBadge } from './ui/status-badge';
import type { PaymentStatus } from '@/types/database';

interface PaymentRowProps {
  periodMonth: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  studentName?: string;
  groupName?: string;
}

export function PaymentRow({ periodMonth, amount, status, dueDate, studentName, groupName }: PaymentRowProps) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
      <View className="flex-1">
        {studentName ? (
          <Text className="text-sm font-medium text-gray-900">{studentName}</Text>
        ) : null}
        <Text className="text-sm text-gray-600">{periodMonth}</Text>
        {groupName ? (
          <Text className="text-xs text-gray-400">{groupName}</Text>
        ) : null}
      </View>
      <View className="items-end gap-1">
        <Text className="text-sm font-semibold text-gray-900">{amount} TL</Text>
        <StatusBadge status={status} />
      </View>
    </View>
  );
}
