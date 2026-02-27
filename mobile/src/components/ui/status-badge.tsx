import { View, Text } from 'react-native';
import type { PaymentStatus } from '@/types/database';

const STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
  paid: { label: 'Ödendi', bg: 'bg-green-100', text: 'text-green-700' },
  pending: { label: 'Bekliyor', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  overdue: { label: 'Gecikmiş', bg: 'bg-red-100', text: 'text-red-700' },
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <View className={`px-2 py-0.5 rounded ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.text}`}>{config.label}</Text>
    </View>
  );
}
