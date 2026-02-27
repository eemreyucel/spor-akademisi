import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
}

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-white"
        placeholderTextColor="#9ca3af"
        {...inputProps}
      />
    </View>
  );
}
