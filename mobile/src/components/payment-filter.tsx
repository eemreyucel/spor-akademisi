import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { PaymentStatus } from '@/types/database';

type FilterValue = 'all' | PaymentStatus;

interface PaymentFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'paid', label: 'Ödendi' },
  { value: 'pending', label: 'Bekliyor' },
  { value: 'overdue', label: 'Gecikmiş' },
];

export function PaymentFilter({ value, onChange }: PaymentFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
      <View className="flex-row gap-2 px-4">
        {FILTERS.map((filter) => {
          const isActive = value === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => onChange(filter.value)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive ? 'text-white' : 'text-gray-700'
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

export type { FilterValue };
