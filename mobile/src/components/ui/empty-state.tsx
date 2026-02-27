import { View, Text } from 'react-native';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-gray-400 text-base">{message}</Text>
    </View>
  );
}
