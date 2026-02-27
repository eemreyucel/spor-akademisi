import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { GroupItem } from '@/hooks/use-groups';

interface GroupSelectorProps {
  groups: GroupItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function GroupSelector({ groups, selectedId, onSelect }: GroupSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
      <View className="flex-row gap-2 px-4">
        {groups.map((group) => {
          const isActive = selectedId === group.id;
          return (
            <TouchableOpacity
              key={group.id}
              className={`px-4 py-2 rounded-full border ${
                isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
              }`}
              onPress={() => onSelect(group.id)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive ? 'text-white' : 'text-gray-700'
                }`}
              >
                {group.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
