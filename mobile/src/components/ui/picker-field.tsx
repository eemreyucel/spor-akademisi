import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';

interface PickerOption {
  value: string;
  label: string;
}

interface PickerFieldProps {
  label: string;
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function PickerField({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Seçiniz...',
}: PickerFieldProps) {
  const [visible, setVisible] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      <TouchableOpacity
        className="border border-gray-300 rounded-lg px-4 py-3 bg-white flex-row justify-between items-center"
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text className={selectedLabel ? 'text-base text-gray-900' : 'text-base text-gray-400'}>
          {selectedLabel ?? placeholder}
        </Text>
        <Text className="text-gray-400">▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/30">
          <SafeAreaView className="bg-white rounded-t-2xl">
            <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
              <Text className="text-base font-semibold text-gray-900">{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text className="text-blue-600 font-medium">Kapat</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`px-4 py-3 border-b border-gray-100 ${
                    item.value === value ? 'bg-blue-50' : ''
                  }`}
                  onPress={() => {
                    onValueChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    className={`text-base ${
                      item.value === value ? 'text-blue-600 font-medium' : 'text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
