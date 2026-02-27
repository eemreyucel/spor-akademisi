import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBadge } from './ui/status-badge';
import type { PaymentStatus } from '@/types/database';

interface AdminPaymentRowProps {
  studentName: string;
  groupName: string;
  periodMonth: string;
  amount: number;
  status: PaymentStatus;
  onMarkPaid: () => void;
  marking: boolean;
}

export function AdminPaymentRow({
  studentName,
  groupName,
  periodMonth,
  amount,
  status,
  onMarkPaid,
  marking,
}: AdminPaymentRowProps) {
  return (
    <View className="py-3 border-b border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-900">{studentName}</Text>
          <Text className="text-xs text-gray-400">{groupName}</Text>
          <Text className="text-sm text-gray-600">{periodMonth}</Text>
        </View>
        <View className="items-end gap-1">
          <Text className="text-sm font-semibold text-gray-900">{amount} TL</Text>
          <StatusBadge status={status} />
        </View>
      </View>

      {status !== 'paid' && (
        <TouchableOpacity
          className={`mt-2 py-2 rounded-lg ${marking ? 'bg-green-400' : 'bg-green-600'}`}
          onPress={onMarkPaid}
          disabled={marking}
          activeOpacity={0.7}
        >
          {marking ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="text-white text-center text-sm font-medium">
              Ödendi İşaretle
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
